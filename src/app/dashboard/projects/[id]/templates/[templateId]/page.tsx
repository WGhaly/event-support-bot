'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';

// Register Konva shapes only on client-side
if (typeof window !== 'undefined') {
  // Dynamic import to avoid server-side rendering issues
  import('konva/lib/shapes/Image');
  import('konva/lib/shapes/Text');
  import('konva/lib/shapes/Transformer');
}

interface TemplateField {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  align: string;
  verticalAlign: string;
  fill: string;
  rotation: number;
}

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  fields: string;
  projectId: string;
}

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string; templateId: string }> }) {
  const { id: projectId, templateId } = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const stageRef = useRef<any>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        const data = await response.json();
        
        if (data.success) {
          setTemplate(data.data);
          
          // Parse existing fields
          const parsedFields = JSON.parse(data.data.fields || '[]');
          setFields(parsedFields);
          
          // Load image
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = data.data.imageUrl;
          img.onload = () => {
            setImage(img);
            setLoading(false);
          };
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        setLoading(false);
      }
    }
    
    loadTemplate();
  }, [templateId]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (fields.length === 0 || !template) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveFields();
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [fields, template]);

  const saveFields = async () => {
    if (!template) return;

    setSaving(true);
    try {
      await fetch(`/api/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: JSON.stringify(fields),
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save fields:', error);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to estimate optimal font size
  const calculateOptimalFontSize = (text: string, width: number, height: number, fontFamily: string = 'Arial'): number => {
    if (!text || text.length === 0) return 16;
    
    // Estimate character width (rough approximation)
    const avgCharWidth = 0.6; // Average character is ~0.6x font size
    const lineHeight = 1.2;
    
    let minSize = 6;
    let maxSize = 200;
    let optimalSize = minSize;
    
    while (minSize <= maxSize) {
      const mid = Math.floor((minSize + maxSize) / 2);
      
      // Estimate how many characters fit per line
      const charsPerLine = Math.floor(width / (mid * avgCharWidth));
      const estimatedLines = Math.ceil(text.length / Math.max(charsPerLine, 1));
      const estimatedHeight = estimatedLines * mid * lineHeight;
      
      if (estimatedHeight <= height && charsPerLine > 0) {
        optimalSize = mid;
        minSize = mid + 1;
      } else {
        maxSize = mid - 1;
      }
    }
    
    return Math.max(6, optimalSize);
  };

  const addTextField = () => {
    const width = 200;
    const height = 40;
    const text = 'Double-click to edit';
    const fontFamily = 'Arial';
    const fontSize = calculateOptimalFontSize(text, width, height, fontFamily);
    
    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width,
      height,
      text,
      fontSize,
      fontFamily,
      fontStyle: 'normal',
      align: 'left',
      verticalAlign: 'top',
      fill: '#000000',
      rotation: 0,
    };
    setFields([...fields, newField]);
    setSelectedId(newField.id);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(f => {
      if (f.id !== id) return f;
      
      const updated = { ...f, ...updates };
      
      // Recalculate font size if text changed
      if (updates.text !== undefined && updates.text !== f.text) {
        const newFontSize = calculateOptimalFontSize(
          updated.text,
          updated.width,
          updated.height,
          updated.fontFamily
        );
        updated.fontSize = newFontSize;
      }
      
      return updated;
    }));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedField = fields.find(f => f.id === selectedId);

  // Calculate canvas scale to fit in viewport
  const maxCanvasWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 400, 1200) : 1200;
  const scale = template ? Math.min(maxCanvasWidth / template.imageWidth, 1) : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template || !image) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load template</p>
          <Link href={`/dashboard/projects/${projectId}`} className="text-blue-600 hover:underline">
            Back to project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/projects/${projectId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-600">
                {template.imageWidth} × {template.imageHeight}px
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {saving && (
              <span className="text-sm text-blue-600">Saving...</span>
            )}
            <button
              onClick={saveFields}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg inline-block">
            <Stage
              ref={stageRef}
              width={template.imageWidth * scale}
              height={template.imageHeight * scale}
              scaleX={scale}
              scaleY={scale}
              onClick={(e) => {
                // Deselect when clicking on empty area
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) {
                  setSelectedId(null);
                }
              }}
            >
              <Layer>
                {/* Background Image */}
                <KonvaImage image={image} />
                
                {/* Text Fields */}
                {fields.map((field) => (
                  <TextField
                    key={field.id}
                    field={field}
                    isSelected={field.id === selectedId}
                    onSelect={() => setSelectedId(field.id)}
                    onChange={(updates) => updateField(field.id, updates)}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
          {/* Add Field Button */}
          <button
            onClick={addTextField}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition mb-6"
          >
            + Add Text Field
          </button>

          {/* Fields List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Fields ({fields.length})</h3>
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    field.id === selectedId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedId(field.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {field.text}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteField(field.id);
                      }}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Properties */}
          {selectedField && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Properties</h3>
              
              <div className="space-y-4">
                {/* Text Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text
                  </label>
                  <input
                    type="text"
                    value={selectedField.text}
                    onChange={(e) => updateField(selectedField.id, { text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {selectedField.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={selectedField.fontSize}
                    onChange={(e) => updateField(selectedField.id, { fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={selectedField.fontFamily}
                    onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

                {/* Font Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Style
                  </label>
                  <select
                    value={selectedField.fontStyle}
                    onChange={(e) => updateField(selectedField.id, { fontStyle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>

                {/* Horizontal Align */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horizontal Align
                  </label>
                  <div className="flex space-x-2">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateField(selectedField.id, { align })}
                        className={`flex-1 py-2 px-3 rounded border transition ${
                          selectedField.align === align
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Align */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vertical Align
                  </label>
                  <div className="flex space-x-2">
                    {['top', 'middle', 'bottom'].map((vAlign) => (
                      <button
                        key={vAlign}
                        onClick={() => updateField(selectedField.id, { verticalAlign: vAlign })}
                        className={`flex-1 py-2 px-3 rounded border transition ${
                          selectedField.verticalAlign === vAlign
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {vAlign.charAt(0).toUpperCase() + vAlign.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={selectedField.fill}
                    onChange={(e) => updateField(selectedField.id, { fill: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// TextField Component with Transformer
function TextField({
  field,
  isSelected,
  onSelect,
  onChange,
}: {
  field: TemplateField;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<TemplateField>) => void;
}) {
  const textRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={textRef}
        {...field}
        draggable
        wrap="word"
        ellipsis={false}
        verticalAlign={field.verticalAlign || 'top'}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = textRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          const newWidth = Math.max(50, node.width() * scaleX);
          const newHeight = Math.max(20, node.height() * scaleY);

          // Calculate optimal font size to fit text within the new box dimensions
          let optimalFontSize = field.fontSize;
          const text = node.text();
          
          if (text && text.length > 0) {
            const originalFontSize = node.fontSize();
            const originalWidth = node.width();
            
            node.width(newWidth);

            // Binary search for optimal font size
            let minSize = 6;
            let maxSize = 200;

            while (minSize <= maxSize) {
              const mid = Math.floor((minSize + maxSize) / 2);
              node.fontSize(mid);
              
              const textHeight = node.height();
              
              if (textHeight <= newHeight) {
                optimalFontSize = mid;
                minSize = mid + 1;
              } else {
                maxSize = mid - 1;
              }
            }

            node.fontSize(originalFontSize);
            node.width(originalWidth);
          }

          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            fontSize: optimalFontSize,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left',
            'top-center',
            'top-right',
            'middle-left',
            'middle-right',
            'bottom-left',
            'bottom-center',
            'bottom-right',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
