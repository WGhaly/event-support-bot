import { NextResponse } from 'next/server';
import { initializeFonts } from '@/lib/badge-generator';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';

/**
 * Simple test endpoint to verify font rendering works
 * Creates a basic badge with text to test the font fix
 */
export async function GET() {
  try {
    console.log('[TEST BADGE] Starting simple badge test...');
    
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

    // Create a simple test canvas
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    
    // Test rendering with Inter (regular)
    ctx.fillStyle = '#000000';
    ctx.font = '48px Inter';
    ctx.fillText('Name: John Doe', 50, 100);
    console.log('[TEST BADGE] Rendered regular text with Inter');
    
    // Test rendering with Inter Bold
    ctx.font = '48px Inter Bold';
    ctx.fillText('Title: Software Engineer', 50, 200);
    console.log('[TEST BADGE] Rendered bold text with Inter Bold');
    
    // Test with smaller text
    ctx.font = '32px Inter';
    ctx.fillText('Company: TechCorp', 50, 300);
    console.log('[TEST BADGE] Rendered company text');
    
    ctx.font = '32px Inter';
    ctx.fillText('Email: john.doe@example.com', 50, 400);
    console.log('[TEST BADGE] Rendered email text');
    
    // Add a note about the test
    ctx.font = '24px Inter';
    ctx.fillStyle = '#666666';
    ctx.fillText('Test badge - Font fix verification', 50, 550);
    
    // Encode to PNG
    const pngBuffer = await canvas.encode('png');
    console.log('[TEST BADGE] Badge generated successfully, size:', pngBuffer.length);
    
    // Return as PNG
    return new NextResponse(pngBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="test-badge.png"',
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
