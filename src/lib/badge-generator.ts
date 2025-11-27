import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

// Register default fonts
try {
  // Try to load system fonts (macOS/Linux)
  const systemFonts = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/Times.ttc',
    '/System/Library/Fonts/Courier.ttc',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];

  for (const fontPath of systemFonts) {
    try {
      GlobalFonts.registerFromPath(fontPath);
    } catch (e) {
      // Font not found, continue
    }
  }
} catch (e) {
  console.warn('Could not register system fonts, using defaults');
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
    for (const field of fields) {
      const columnName = mappings[field.id];
      if (!columnName) continue;

      const value = row[columnName];
      const text = String(value ?? '');

      if (!text) continue;

      // Calculate optimal font size to fit text within field dimensions
      const fontStyle = field.fontStyle || '';
      let optimalFontSize = field.fontSize;
      
      // Binary search for optimal font size if width/height are specified
      if (field.width && field.height) {
        let minSize = 6;
        let maxSize = field.fontSize || 200;
        
        while (minSize <= maxSize) {
          const mid = Math.floor((minSize + maxSize) / 2);
          ctx.font = `${fontStyle} ${mid}px ${field.fontFamily}`;
          
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
      ctx.font = `${fontStyle} ${optimalFontSize}px ${field.fontFamily}`;
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
