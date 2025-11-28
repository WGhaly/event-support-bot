import { NextResponse } from 'next/server';
import { initializeFonts } from '@/lib/badge-generator';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

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

    // Create a simple test canvas
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    logs.push('Canvas created');
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    logs.push('White background drawn');
    
    // Test rendering with Inter (regular)
    ctx.fillStyle = '#000000';
    ctx.font = '48px Inter';
    logs.push(`Font set to: "${ctx.font}"`);
    
    // Check if font is available
    const fontsBefore = GlobalFonts.families.map(f => f.family);
    logs.push(`Available fonts BEFORE fillText: ${JSON.stringify(fontsBefore)}`);
    
    ctx.fillText('Name: John Doe', 50, 100);
    logs.push('Rendered regular text with Inter');
    
    // Test rendering with Inter Bold
    ctx.font = '48px Inter Bold';
    logs.push(`Font set to: "${ctx.font}"`);
    ctx.fillText('Title: Software Engineer', 50, 200);
    logs.push('Rendered bold text with Inter Bold');
    
    // Test with smaller text
    ctx.font = '32px Inter';
    ctx.fillText('Company: TechCorp', 50, 300);
    logs.push('Rendered company text');
    
    ctx.font = '32px Inter';
    ctx.fillText('Email: john.doe@example.com', 50, 400);
    logs.push('Rendered email text');
    
    // Add a note about the test
    ctx.font = '24px Inter';
    ctx.fillStyle = '#666666';
    ctx.fillText('Test badge - Font fix verification', 50, 550);
    
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
