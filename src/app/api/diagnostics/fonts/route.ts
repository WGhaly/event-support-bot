import { NextResponse } from 'next/server';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'local',
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  try {
    // Check possible font directories
    const possibleFontDirs = [
      path.join(process.cwd(), 'src', 'fonts'),
      path.join(process.cwd(), '.next', 'server', 'fonts'),
      path.join(process.cwd(), 'public', 'fonts'),
      path.join(process.cwd(), 'fonts'),
    ];

    diagnostics.fontDirectories = possibleFontDirs.map(dir => {
      const exists = fs.existsSync(dir);
      const contents = exists ? fs.readdirSync(dir) : [];
      return {
        path: dir,
        exists,
        contents,
        hasInterRegular: exists && fs.existsSync(path.join(dir, 'Inter-Regular.ttf')),
        hasInterBold: exists && fs.existsSync(path.join(dir, 'Inter-Bold.ttf')),
      };
    });

    // Get registered fonts
    diagnostics.registeredFonts = {
      families: GlobalFonts.families,
      count: GlobalFonts.families.length,
    };

    // Test canvas creation
    try {
      const canvas = createCanvas(200, 100);
      const ctx = canvas.getContext('2d');
      
      diagnostics.canvasTest = {
        success: true,
        canvasCreated: true,
      };

      // Test text rendering with different fonts
      const testResults = [];
      
      for (const font of ['Inter', 'Arial', 'sans-serif', 'serif']) {
        try {
          ctx.font = `20px ${font}`;
          ctx.fillStyle = '#000000';
          ctx.fillText('Test', 10, 30);
          testResults.push({
            font,
            success: true,
          });
        } catch (e: any) {
          testResults.push({
            font,
            success: false,
            error: e.message,
          });
        }
      }
      
      diagnostics.textRenderingTests = testResults;

      // Try to generate a test badge
      try {
        const testCanvas = createCanvas(300, 150);
        const testCtx = testCanvas.getContext('2d');
        
        // Draw background
        testCtx.fillStyle = '#ffffff';
        testCtx.fillRect(0, 0, 300, 150);
        
        // Draw border
        testCtx.strokeStyle = '#000000';
        testCtx.lineWidth = 2;
        testCtx.strokeRect(0, 0, 300, 150);
        
        // Try to draw text
        testCtx.font = '24px Inter';
        testCtx.fillStyle = '#000000';
        testCtx.textAlign = 'center';
        testCtx.textBaseline = 'middle';
        testCtx.fillText('John Doe', 150, 50);
        
        testCtx.font = '16px Inter';
        testCtx.fillText('Software Engineer', 150, 80);
        testCtx.fillText('TechCorp', 150, 105);
        
        // Encode to base64
        const buffer = await testCanvas.encode('png');
        const base64 = buffer.toString('base64');
        
        diagnostics.testBadge = {
          success: true,
          imageBase64: `data:image/png;base64,${base64}`,
          bufferSize: buffer.length,
        };
      } catch (e: any) {
        diagnostics.testBadge = {
          success: false,
          error: e.message,
          stack: e.stack,
        };
      }
    } catch (e: any) {
      diagnostics.canvasTest = {
        success: false,
        error: e.message,
        stack: e.stack,
      };
    }

    // Check if @napi-rs/canvas module is loaded correctly
    try {
      diagnostics.napiRsCanvas = {
        loaded: true,
        createCanvas: typeof createCanvas,
        GlobalFonts: typeof GlobalFonts,
      };
    } catch (e: any) {
      diagnostics.napiRsCanvas = {
        loaded: false,
        error: e.message,
      };
    }

  } catch (e: any) {
    diagnostics.error = {
      message: e.message,
      stack: e.stack,
    };
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
