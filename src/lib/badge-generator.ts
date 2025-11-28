import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

let fontsInitialized = false;
let registeredFonts: string[] = [];

/**
 * Get the list of registered fonts
 */
export function getRegisteredFonts(): string[] {
  return [...registeredFonts];
}

/**
 * Initialize and register fonts for canvas text rendering
 * Must be called before generating badges
 */
export function initializeFonts(): { success: boolean; fontsRegistered: number; error?: string } {
  // Check if fonts are actually registered
  console.log(`[FONT INIT] fontsInitialized flag: ${fontsInitialized}`);
  console.log(`[FONT INIT] registeredFonts:`, registeredFonts);
  
  if (fontsInitialized && registeredFonts.length >= 2) {
    console.log(`[FONT INIT] Fonts already initialized, returning success`);
    return { success: true, fontsRegistered: registeredFonts.length };
  }
  
  // If flag is true but no fonts registered, something went wrong - reinitialize
  if (fontsInitialized && registeredFonts.length === 0) {
    console.log(`[FONT INIT] WARNING: fontsInitialized=true but no fonts registered! Reinitializing...`);
    fontsInitialized = false;
  }

  try {
    const cwd = process.cwd();
    console.log(`[FONT INIT] Current working directory: ${cwd}`);
    
    // Try multiple possible paths for fonts
    const possibleFontDirs = [
      path.join(cwd, 'src', 'fonts'),           // Source directory (bundled in .next)
      path.join(cwd, '.next', 'server', 'fonts'), // Next.js server build output
      path.join(cwd, 'public', 'fonts'),        // Public directory
      path.join(cwd, 'fonts'),                  // Root fonts directory
    ];
    
    let fontsDir = '';
    for (const dir of possibleFontDirs) {
      console.log(`[FONT INIT] Checking directory: ${dir}`);
      if (fs.existsSync(dir)) {
        const hasInterRegular = fs.existsSync(path.join(dir, 'Inter-Regular.ttf'));
        console.log(`[FONT INIT] Directory exists: ${dir}, has Inter-Regular.ttf: ${hasInterRegular}`);
        if (hasInterRegular) {
          fontsDir = dir;
          console.log(`[FONT INIT] ✓ Found fonts directory: ${dir}`);
          break;
        }
      }
    }
    
    if (!fontsDir) {
      const error = '[FONT INIT] ⚠️ No fonts directory found! Checked: ' + possibleFontDirs.join(', ');
      console.error(error);
      return { success: false, fontsRegistered: 0, error };
    }
    
    // Register bundled Inter fonts using canvas's registerFont
    const bundledFonts = [
      { path: path.join(fontsDir, 'Inter-Regular.ttf'), family: 'Inter', weight: 'normal' },
      { path: path.join(fontsDir, 'Inter-Bold.ttf'), family: 'Inter', weight: 'bold' },
    ];

    let fontsReg = 0;
    const errors: string[] = [];
    
    for (const font of bundledFonts) {
      try {
        const exists = fs.existsSync(font.path);
        console.log(`[FONT INIT] Font file ${font.path} exists: ${exists}`);
        
        if (exists) {
          // node-canvas registerFont API
          registerFont(font.path, { family: font.family, weight: font.weight as any });
          registeredFonts.push(`${font.family} ${font.weight}`);
          fontsReg++;
          console.log(`[FONT INIT] ✓ Registered font: ${font.family} (${font.weight}) from ${font.path}`);
        } else {
          errors.push(`Font file not found: ${font.path}`);
        }
      } catch (e: any) {
        const errorMsg = `Could not register font ${font.family}: ${e.message}`;
        console.error(`[FONT INIT] ✗ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    if (fontsReg === 0) {
      const error = '[FONT INIT] ⚠️ WARNING: No fonts were registered! Text rendering will fail. ' + errors.join('; ');
      console.error(error);
      return { success: false, fontsRegistered: 0, error };
    } else {
      console.log(`[FONT INIT] ✓ Successfully registered ${fontsReg} font(s)`);
      console.log('[FONT INIT] Registered fonts:', registeredFonts);
      
      fontsInitialized = true;
      return { success: true, fontsRegistered: fontsReg };
    }
  } catch (e: any) {
    const error = '[FONT INIT] ⚠️ CRITICAL: Font registration failed: ' + e.message;
    console.error(error);
    return { success: false, fontsRegistered: 0, error };
  }
}

// Try to initialize fonts on module load
initializeFonts();

/**
 * Map common font families to available bundled fonts
 * With node-canvas, we register Inter with different weights,
 * so we just return 'Inter' and let CSS handle bold/normal
 */
function normalizeFontFamily(fontFamily: string): string {
  const normalized = fontFamily.toLowerCase();
  
  // Map common system fonts to Inter
  const fontMap: Record<string, string> = {
    'arial': 'Inter',
    'helvetica': 'Inter',
    'sans-serif': 'Inter',
    'system-ui': 'Inter',
    'roboto': 'Inter',
    'open sans': 'Inter',
    'segoe ui': 'Inter',
    'inter': 'Inter',
  };
  
  // Just return the base font - node-canvas handles weight separately
  return fontMap[normalized] || 'Inter';
}

export interface TemplateField {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontStyle?: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  rotation?: number;
}

export interface BadgeGenerationOptions {
  templateImageUrl: string;
  templateWidth: number;
  templateHeight: number;
  fields: TemplateField[];
  mappings: Record<string, string>; // fieldId -> columnName
  dataRows: Record<string, unknown>[];
  onProgress?: (current: number, total: number) => void;
}

/**
 * Wrap text to fit within specified width
 */
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.length > 0 ? lines : [text];
}

/**
 * Generate badges from template and dataset
 * Returns array of PNG buffers
 */
export async function generateBadges(
  options: BadgeGenerationOptions
): Promise<Buffer[]> {
  const {
    templateImageUrl,
    templateWidth,
    templateHeight,
    fields,
    mappings,
    dataRows,
    onProgress,
  } = options;

  // Log registered fonts at start of badge generation
  console.log('[BADGE GEN] ========== Starting Badge Generation ==========');
  console.log('[BADGE GEN] Registered fonts:', registeredFonts);
  console.log('[BADGE GEN] Font count:', registeredFonts.length);
  console.log('[BADGE GEN] Template size:', templateWidth, 'x', templateHeight);
  console.log('[BADGE GEN] Fields to process:', fields.length);
  console.log('[BADGE GEN] Data rows:', dataRows.length);

  // Load template image once
  const templateImage = await loadImage(templateImageUrl);

  const badges: Buffer[] = [];
  const startTime = Date.now();

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];

    // Create canvas for this badge
    const canvas = createCanvas(templateWidth, templateHeight);
    const ctx = canvas.getContext('2d');

    // Draw template image
    ctx.drawImage(templateImage, 0, 0, templateWidth, templateHeight);

    // Draw text fields with mapped data
    console.log(`[BADGE GEN] Processing ${fields.length} fields for row ${i + 1}`);
    for (const field of fields) {
      const columnName = mappings[field.id];
      console.log(`[BADGE GEN] Field ${field.id} (${field.text}) -> column: ${columnName}`);
      if (!columnName) {
        console.log(`[BADGE GEN] No mapping for field ${field.id}, skipping`);
        continue;
      }

      const value = row[columnName];
      const text = String(value ?? '');
      console.log(`[BADGE GEN] Value from row: "${text}"`);

      if (!text) {
        console.log(`[BADGE GEN] Empty text for field ${field.id}, skipping`);
        continue;
      }

      // Calculate optimal font size to fit text within field dimensions
      const fontStyle = field.fontStyle || '';
      const isBold = fontStyle.toLowerCase().includes('bold');
      const normalizedFont = normalizeFontFamily(field.fontFamily);
      let optimalFontSize = field.fontSize;
      
      console.log(`[BADGE GEN] Field config: font="${field.fontFamily}", style="${fontStyle}", isBold=${isBold}, normalized="${normalizedFont}", size=${optimalFontSize}`);
      
      // Binary search for optimal font size if width/height are specified
      if (field.width && field.height) {
        let minSize = 6;
        let maxSize = field.fontSize || 200;
        
        while (minSize <= maxSize) {
          const mid = Math.floor((minSize + maxSize) / 2);
          // node-canvas handles 'bold' style correctly
          ctx.font = `${fontStyle} ${mid}px ${normalizedFont}`;
          
          // Wrap text and measure total height
          const lines = wrapText(ctx, text, field.width);
          const lineHeight = mid * 1.2;
          const totalHeight = lines.length * lineHeight;
          
          if (totalHeight <= field.height) {
            optimalFontSize = mid;
            minSize = mid + 1;
          } else {
            maxSize = mid - 1;
          }
        }
      }

      // Configure text style with optimal font size
      // Use normalized font directly (already includes Bold if needed)
      // Don't add fontStyle 'bold' modifier as it conflicts with 'Inter Bold' family name
      const fontStyleWithoutBold = isBold ? fontStyle.replace(/bold/gi, '').trim() : fontStyle;
      const finalFontString = `${fontStyleWithoutBold} ${optimalFontSize}px ${normalizedFont}`.trim();
      ctx.font = finalFontString;
      ctx.fillStyle = field.fill;
      ctx.textBaseline = 'top';

      // Wrap text if width is specified
      const lines = field.width ? wrapText(ctx, text, field.width) : [text];
      const lineHeight = optimalFontSize * 1.2;
      const totalTextHeight = lines.length * lineHeight;

      // Calculate vertical alignment offset
      let verticalOffset = 0;
      if (field.verticalAlign === 'middle' && field.height) {
        verticalOffset = (field.height - totalTextHeight) / 2;
      } else if (field.verticalAlign === 'bottom' && field.height) {
        verticalOffset = field.height - totalTextHeight;
      }
      
      console.log(`[BADGE GEN] Setting font: "${finalFontString}"`);
      console.log(`[BADGE GEN] Text color: ${field.fill}`);
      console.log(`[BADGE GEN] Text to render: "${text}"`);
      console.log(`[BADGE GEN] Lines to render: ${lines.length}`);
      console.log(`[BADGE GEN] Current ctx.font: "${ctx.font}"`);
      console.log(`[BADGE GEN] Position: (${field.x}, ${field.y}), Size: ${field.width}x${field.height}`);
      console.log(`[BADGE GEN] Alignment: ${field.align || 'left'}, Vertical: ${field.verticalAlign || 'top'}`);
      console.log(`[BADGE GEN] Line height: ${lineHeight}, Total height: ${totalTextHeight}`);
      console.log(`[BADGE GEN] Vertical offset: ${verticalOffset}`);
      console.log(`[BADGE GEN] Available fonts before render:`, registeredFonts);

      // Apply rotation if specified
      if (field.rotation) {
        ctx.save();
        ctx.translate(field.x, field.y);
        ctx.rotate((field.rotation * Math.PI) / 180);
        
        // Draw each line
        lines.forEach((line, index) => {
          const yOffset = verticalOffset + (index * lineHeight);
          const xOffset = field.align === 'center' ? field.width / 2 : field.align === 'right' ? field.width : 0;
          ctx.textAlign = field.align || 'left';
          try {
            console.log(`[BADGE GEN] Rendering line ${index + 1}/${lines.length}: "${line}" at (${xOffset}, ${yOffset})`);
            ctx.fillText(line, xOffset, yOffset);
            console.log(`[BADGE GEN] ✓ Line rendered successfully`);
          } catch (err: any) {
            console.error(`[BADGE GEN] ✗ Error rendering line:`, err.message);
            throw err;
          }
        });
        
        ctx.restore();
      } else {
        // Draw each line
        lines.forEach((line, index) => {
          const yOffset = field.y + verticalOffset + (index * lineHeight);
          const xOffset = field.align === 'center' ? field.x + field.width / 2 : field.align === 'right' ? field.x + field.width : field.x;
          ctx.textAlign = field.align || 'left';
          try {
            console.log(`[BADGE GEN] Rendering line ${index + 1}/${lines.length}: "${line}" at (${xOffset}, ${yOffset})`);
            ctx.fillText(line, xOffset, yOffset);
            console.log(`[BADGE GEN] ✓ Line rendered successfully`);
          } catch (err: any) {
            console.error(`[BADGE GEN] ✗ Error rendering line:`, err.message);
            throw err;
          }
        });
      }
    }

    // Encode to PNG (node-canvas uses toBuffer instead of encode)
    const pngBuffer = canvas.toBuffer('image/png');
    badges.push(pngBuffer);

    // Report progress
    if (onProgress) {
      onProgress(i + 1, dataRows.length);
    }

    // Log performance for first badge
    if (i === 0) {
      const elapsed = Date.now() - startTime;
      console.log(`First badge generated in ${elapsed}ms`);
    }
  }

  const totalTime = Date.now() - startTime;
  const avgTime = totalTime / dataRows.length;
  console.log(
    `Generated ${dataRows.length} badges in ${totalTime}ms (avg: ${avgTime.toFixed(0)}ms per badge)`
  );

  return badges;
}

/**
 * Generate a single badge for preview
 */
export async function generatePreviewBadge(
  templateImageUrl: string,
  templateWidth: number,
  templateHeight: number,
  fields: TemplateField[],
  mappings: Record<string, string>,
  dataRow: Record<string, unknown>
): Promise<Buffer> {
  const badges = await generateBadges({
    templateImageUrl,
    templateWidth,
    templateHeight,
    fields,
    mappings,
    dataRows: [dataRow],
  });

  return badges[0];
}
