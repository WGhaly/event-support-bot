import { NextResponse } from 'next/server';
import { generateBadges, initializeFonts } from '@/lib/badge-generator';
import { GlobalFonts } from '@napi-rs/canvas';

/**
 * Test endpoint to generate a single badge with hardcoded data
 * This helps verify the font fix works without needing authentication
 */
export async function GET() {
  try {
    console.log('[TEST BADGE] Starting test badge generation...');
    
    // Initialize fonts explicitly
    const fontInit = initializeFonts();
    console.log('[TEST BADGE] Font initialization:', fontInit);
    console.log('[TEST BADGE] Registered fonts:', GlobalFonts.families);
    
    if (!fontInit.success) {
      return NextResponse.json({
        success: false,
        error: `Font initialization failed: ${fontInit.error}`,
      });
    }
    
    // Hardcoded test data matching our template
    const testData = {
      name: 'John Doe',
      title: 'Software Engineer',
      company: 'TechCorp',
      email: 'john.doe@example.com',
    };
    
    // Template fields from our actual template
    const fields = [
      {
        id: 'field-1732711852736',
        text: 'Name',
        x: 166,
        y: 221,
        width: 613,
        height: 125,
        fontSize: 97,
        fontFamily: 'Arial',
        fill: '#000000',
        fontStyle: '',
        align: 'left' as const,
        verticalAlign: 'top' as const,
      },
      {
        id: 'field-1732711862050',
        text: 'Title',
        x: 166,
        y: 389,
        width: 261,
        height: 44,
        fontSize: 34,
        fontFamily: 'Arial',
        fill: '#000000',
        fontStyle: '',
        align: 'left' as const,
        verticalAlign: 'top' as const,
      },
      {
        id: 'field-1732711867377',
        text: 'Company',
        x: 549,
        y: 390,
        width: 237,
        height: 42,
        fontSize: 33,
        fontFamily: 'Arial',
        fill: '#000000',
        fontStyle: '',
        align: 'left' as const,
        verticalAlign: 'top' as const,
      },
      {
        id: 'field-1732711887185',
        text: 'Email',
        x: 165,
        y: 464,
        width: 617,
        height: 43,
        fontSize: 33,
        fontFamily: 'Arial',
        fill: '#000000',
        fontStyle: '',
        align: 'left' as const,
        verticalAlign: 'top' as const,
      },
    ];
    
    // Mappings
    const mappings = {
      'field-1732711852736': 'name',
      'field-1732711862050': 'title',
      'field-1732711867377': 'company',
      'field-1732711887185': 'email',
    };
    
    // Use the actual template URL from Blob Storage
    const templateUrl = 'https://7hxlnnedz4sp1zmo.public.blob.vercel-storage.com/templates/cmihzfedr0001rynjum224ljh/the-real-test-WUQ5YaTxZTiCPZkCjcXeKFjGvNaOGe.png';
    
    console.log('[TEST BADGE] Generating badge with test data...');
    const badges = await generateBadges({
      templateImageUrl: templateUrl,
      templateWidth: 1004,
      templateHeight: 649,
      fields,
      mappings,
      dataRows: [testData],
    });
    
    console.log('[TEST BADGE] Badge generated, size:', badges[0].length, 'bytes');
    
    // Return the badge as a PNG image
    return new NextResponse(Buffer.from(badges[0]), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': badges[0].length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[TEST BADGE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
