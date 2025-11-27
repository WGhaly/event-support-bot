import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils';

const MAX_ROWS = 10000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// GET datasets for a project
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        createErrorResponse('Project ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    const datasets = await prisma.dataset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' as const },
    });

    return NextResponse.json(createSuccessResponse(datasets));
  } catch (error) {
    console.error('Get datasets error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch datasets', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}

// POST create a new dataset
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const projectId = formData.get('projectId') as string;

    if (!file || !name || !projectId) {
      return NextResponse.json(
        createErrorResponse(
          'File, name, and project ID are required',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        createErrorResponse('Project not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        createErrorResponse(
          'File size must be less than 5MB',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Determine file type
    const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv';
    const isExcel =
      file.name.endsWith('.xlsx') ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        createErrorResponse(
          'Only CSV and Excel (.xlsx) files are supported',
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    let columns: string[] = [];
    let data: Record<string, string | number>[] = [];

    if (isCSV) {
      // Parse CSV
      const text = await file.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (result.errors.length > 0) {
        return NextResponse.json(
          createErrorResponse(
            `Parse error: ${result.errors[0].message}`,
            'VALIDATION_ERROR'
          ),
          { status: 400 }
        );
      }

      columns = result.meta.fields || [];
      data = result.data as Record<string, string | number>[];
    } else if (isExcel) {
      // Parse Excel
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return NextResponse.json(
          createErrorResponse('Excel file appears to be empty', 'VALIDATION_ERROR'),
          { status: 400 }
        );
      }

      // Extract columns from first row
      const firstRow = jsonData[0] as Record<string, unknown>;
      columns = Object.keys(firstRow);
      data = jsonData as Record<string, string | number>[];
    }

    // Validate data
    if (columns.length === 0) {
      return NextResponse.json(
        createErrorResponse('No columns found in file', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        createErrorResponse('File appears to be empty', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (data.length > MAX_ROWS) {
      return NextResponse.json(
        createErrorResponse(
          `File has more than ${MAX_ROWS} rows. Please reduce the data size.`,
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    // Save to database
    const dataset = await prisma.dataset.create({
      data: {
        projectId,
        name,
        fileType: isCSV ? 'CSV' : 'XLSX',
        rowCount: data.length,
        columns: JSON.stringify(columns),
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json(
      createSuccessResponse(dataset, 'Dataset imported successfully')
    );
  } catch (error) {
    console.error('Create dataset error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to import dataset', 'SERVER_ERROR'),
      { status: 500 }
    );
  }
}
