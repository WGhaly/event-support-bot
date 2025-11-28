import { NextResponse } from 'next/server';
import { initializeFonts } from '@/lib/badge-generator';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

export const dynamic = 'force-dynamic';

/**
 * Simple test endpoint to verify font rendering works
 * Creates a basic badge with text to test the font fix
 */
export async function GET() {
  const logs: string[] = [];
  
  try {
    logs.push('Starting simple badge test...');
    
    // Initialize fonts explicitly
    const fontInit = initializeFonts();
    logs.push(`Font initialization result: ${JSON.stringify(fontInit)}`);
    logs.push(`Registered fonts: ${JSON.stringify(GlobalFonts.families)}`);
    
    if (!fontInit.success) {
      return NextResponse.json({
        success: false,
        error: `Font initialization failed: ${fontInit.error}`,
        logs,
      });
    }

    // Create a simple test canvas (same size as diagnostic)
    const canvas = createCanvas(300, 150);
    const ctx = canvas.getContext('2d');
    logs.push('Canvas created: 300x150');
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 150);
    logs.push('White background drawn');
    
    // Test rendering with Inter (regular)
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'middle';  // Use middle like diagnostic
    
    // Try without specifying font first (should use default)
    ctx.font = '32px Inter';
    logs.push(`Testing with Inter font: "${ctx.font}"`);
    
    // Test if measureText works (indicates font is loaded)
    const metrics = ctx.measureText('John Doe');
    logs.push(`measureText width: ${metrics.width}`);
    
    // Try strokeText instead of fillText
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.strokeText('John Doe (STROKE)', 10, 50);
    logs.push('Rendered with strokeText');
    
    // Also try fillText
    ctx.fillText('John Doe (FILL)', 10, 80);
    logs.push('Rendered with fillText');
    
    ctx.font = '48px Inter';
    logs.push(`Font set to: "${ctx.font}"`);
    
    ctx.font = '16px Inter';
    ctx.fillText('Software Engineer', 150, 80);
    ctx.fillText('TechCorp', 150, 105);
    logs.push('Rendered additional text');
    
    // Encode to PNG
    const pngBuffer = await canvas.encode('png');
    logs.push(`Badge generated successfully, size: ${pngBuffer.length}`);
    
    // Return JSON with logs and image
    return NextResponse.json({
      success: true,
      bufferSize: pngBuffer.length,
      logs,
      fontInit,
      registeredFonts: GlobalFonts.families,
      imageBase64: `data:image/png;base64,${pngBuffer.toString('base64')}`,
    });
  } catch (error: any) {
    logs.push(`Error: ${error.message}`);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      logs,
    }, { status: 500 });
  }
}
