import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';

// Register bundled fonts for Vercel compatibility
try {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  
  // Register bundled Inter fonts
  const bundledFonts = [
    { path: path.join(fontsDir, 'Inter-Regular.ttf'), family: 'Inter' },
    { path: path.join(fontsDir, 'Inter-Bold.ttf'), family: 'Inter Bold' },
  ];

  let fontsRegistered = 0;
  for (const font of bundledFonts) {
    try {
      GlobalFonts.registerFromPath(font.path, font.family);
      fontsRegistered++;
      console.log(`✓ Registered font: ${font.family} from ${font.path}`);
    } catch (e) {
      console.warn(`✗ Could not register font ${font.family}:`, e);
    }
  }

  if (fontsRegistered === 0) {
    console.error('⚠️ WARNING: No fonts were registered! Text rendering will fail.');
  } else {
    console.log(`✓ Successfully registered ${fontsRegistered} font(s)`);
  }
} catch (e) {
  console.error('⚠️ CRITICAL: Font registration failed:', e);
}

/**
 * Map common font families to available bundled fonts
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
  
  return fontMap[normalized] || 'Inter'; // Default to Inter
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
      const normalizedFont = normalizeFontFamily(field.fontFamily);
      let optimalFontSize = field.fontSize;
      
      // Binary search for optimal font size if width/height are specified
      if (field.width && field.height) {
        let minSize = 6;
        let maxSize = field.fontSize || 200;
        
        while (minSize <= maxSize) {
          const mid = Math.floor((minSize + maxSize) / 2);
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
      ctx.font = `${fontStyle} ${optimalFontSize}px ${normalizedFont}`;
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
          ctx.fillText(line, xOffset, yOffset);
        });
        
        ctx.restore();
      } else {
        // Draw each line
        lines.forEach((line, index) => {
          const yOffset = field.y + verticalOffset + (index * lineHeight);
          const xOffset = field.align === 'center' ? field.x + field.width / 2 : field.align === 'right' ? field.x + field.width : field.x;
          ctx.textAlign = field.align || 'left';
          ctx.fillText(line, xOffset, yOffset);
        });
      }
    }

    // Encode to PNG
    const pngBuffer = await canvas.encode('png');
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
