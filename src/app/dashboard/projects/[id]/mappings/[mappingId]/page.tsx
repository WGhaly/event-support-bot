import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import MappingActions from '@/components/mapping-actions';

async function getFieldMapping(mappingId: string, userId: string) {
  const mapping = await prisma.fieldMapping.findUnique({
    where: { id: mappingId },
    include: {
      template: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      },
      dataset: {
        select: {
          id: true,
          name: true,
          rowCount: true,
          columns: true,
          data: true,
        },
      },
    },
  });

  // Verify ownership through template's project
  if (!mapping || mapping.template.project.userId !== userId) {
    return null;
  }

  return mapping;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; mappingId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { title: 'Unauthorized' };
  }

  const { mappingId } = await params;

  const mapping = await getFieldMapping(mappingId, session.user.id);

  return {
    title: mapping
      ? `${mapping.template.name} → ${mapping.dataset.name} | Field Mapping`
      : 'Field Mapping Not Found',
  };
}

export default async function FieldMappingViewPage({
  params,
}: {
  params: Promise<{ id: string; mappingId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const { id: projectId, mappingId } = await params;

  const mapping = await getFieldMapping(mappingId, session.user.id);

  if (!mapping) {
    notFound();
  }

  const mappingsData = JSON.parse(mapping.mappings as string) as Record<string, string>;
  const templateFields = JSON.parse(mapping.template.fields as string) as Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fill: string;
  }>;
  const datasetData = JSON.parse(mapping.dataset.data as string) as Record<string, unknown>[];

  // Get first 5 rows for preview
  const previewRows = datasetData.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Project
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Field Mapping Details</h1>
          <p className="text-gray-600 mt-2">
            {mapping.template.name} → {mapping.dataset.name}
          </p>
        </div>

        {/* Mapping Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Template</p>
              <p className="font-medium text-gray-900">{mapping.template.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dataset</p>
              <p className="font-medium text-gray-900">{mapping.dataset.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Rows</p>
              <p className="font-medium text-gray-900">{mapping.dataset.rowCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fields Mapped</p>
              <p className="font-medium text-gray-900">{Object.keys(mappingsData).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium text-gray-900">{formatDate(mapping.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Field Mappings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Field Mappings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Field
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dataset Column
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templateFields.map((field) => {
                  const mappedColumn = mappingsData[field.id];
                  return (
                    <tr key={field.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{field.text}</div>
                        <div className="text-xs text-gray-500">
                          {field.fontSize}px • {field.fontFamily}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-400">→</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                          {mappedColumn}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Data Preview (First 5 Rows)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {templateFields.map((field) => (
                    <th
                      key={field.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {field.text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewRows.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    {templateFields.map((field) => {
                      const columnName = mappingsData[field.id];
                      const value = row[columnName];
                      return (
                        <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {datasetData.length > 5 && (
            <p className="text-sm text-gray-600 mt-4">
              Showing 5 of {mapping.dataset.rowCount} rows
            </p>
          )}
        </div>

        {/* Actions */}
        <MappingActions
          projectId={projectId}
          mappingId={mappingId}
          rowCount={mapping.dataset.rowCount}
        />
      </div>
    </div>
  );
}
