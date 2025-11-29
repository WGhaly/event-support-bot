'use client'

import { useState, useRef, useEffect } from 'react'
import { Mail, Eye, Code, Save, Wand2, Upload, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const AVAILABLE_VARIABLES = [
  { name: 'attendeeName', label: 'Attendee Name', description: 'The name of the attendee' },
  { name: 'eventName', label: 'Event Name', description: 'The name of the event' },
  { name: 'eventDate', label: 'Event Date', description: 'The date of the event' },
  { name: 'eventLocation', label: 'Event Location', description: 'The location of the event' },
  { name: 'qrCodeUrl', label: 'QR Code', description: 'QR code for check-in' },
  { name: 'registrationId', label: 'Registration ID', description: 'Unique registration ID' },
]

type TemplateBlock = {
  id: string
  type: 'text' | 'image' | 'button' | 'qrcode' | 'logo'
  content: string
  imageUrl?: string // For uploaded images
  buttonUrl?: string // For button links
  styles?: Record<string, string>
}

export default function EmailTemplateEditor({
  eventId,
  eventLogoUrl,
}: {
  eventId: string
  initialTemplate?: string
  eventLogoUrl?: string | null
}) {
  const [blocks, setBlocks] = useState<TemplateBlock[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [customHtml, setCustomHtml] = useState('')
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set())
  const [showVariableMenu, setShowVariableMenu] = useState<string | null>(null)
  const [activeTextarea, setActiveTextarea] = useState<HTMLTextAreaElement | null>(null)
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  // Load saved template on mount
  useEffect(() => {
    loadSavedTemplate()
  }, [eventId])

  const loadSavedTemplate = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/email-template`)
      if (response.ok) {
        const data = await response.json()
        if (data.template) {
          // Always store the HTML for code view
          setCustomHtml(data.template)
          
          // Try to parse blocks from saved template
          const parsedBlocks = parseHtmlToBlocks(data.template)
          if (parsedBlocks.length > 0) {
            setBlocks(parsedBlocks)
          } else {
            // If we can't parse it, load default blocks for visual mode
            loadDefaultTemplate()
          }
          
          // Always start in visual mode
          setShowCode(false)
        } else {
          loadDefaultTemplate()
        }
      } else {
        loadDefaultTemplate()
      }
    } catch (error) {
      console.error('Failed to load template:', error)
      loadDefaultTemplate()
    } finally {
      setIsLoading(false)
    }
  }

  const addBlock = (type: TemplateBlock['type']) => {
    const newBlock: TemplateBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: {},
    }
    setBlocks([...blocks, newBlock])
  }

  const insertVariable = (variableName: string) => {
    if (showCode) {
      // Insert into code editor
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = customHtml
        const before = text.substring(0, start)
        const after = text.substring(end, text.length)
        const variable = `{${variableName}}`
        setCustomHtml(before + variable + after)
        
        // Set cursor position after inserted variable
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(start + variable.length, start + variable.length)
        }, 0)
      }
    } else if (activeTextarea) {
      // Insert into active block textarea
      const start = activeTextarea.selectionStart
      const end = activeTextarea.selectionEnd
      const text = activeTextarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const variable = `{${variableName}}`
      const newValue = before + variable + after
      
      // Find the block ID from the textarea's data attribute
      const blockId = activeTextarea.getAttribute('data-block-id')
      if (blockId) {
        updateBlock(blockId, newValue)
      }
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        activeTextarea.focus()
        activeTextarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
    
    setShowVariableMenu(null)
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ))
  }

  const updateBlockUrl = (id: string, buttonUrl: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, buttonUrl } : block
    ))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id))
  }

  const handleImageUpload = async (blockId: string, file: File) => {
    setUploadingImages(prev => new Set(prev).add(blockId))
    
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/events/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await response.json()
      
      setBlocks(blocks.map(block => 
        block.id === blockId ? { ...block, imageUrl: url, content: url } : block
      ))
      
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
    }
  }

  const clearImage = (blockId: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, imageUrl: undefined, content: '' } : block
    ))
    const input = fileInputRefs.current.get(blockId)
    if (input) input.value = ''
  }

  const generateHtml = () => {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 30px;">
`

    blocks.forEach(block => {
      switch (block.type) {
        case 'text':
          html += `              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; text-align: center;">${block.content}</p>\n`
          break
        case 'logo':
          const logoUrl = block.imageUrl || eventLogoUrl || 'https://via.placeholder.com/200x80?text=Logo'
          html += `              <div style="text-align: center; margin: 20px 0 30px 0;">
                <img src="${logoUrl}" alt="Event Logo" style="max-width: 200px; height: auto;" />
              </div>\n`
          break
        case 'image':
          const imgUrl = block.imageUrl || block.content || 'https://via.placeholder.com/600x300'
          html += `              <div style="text-align: center; margin: 20px 0;">
                <img src="${imgUrl}" alt="Image" style="max-width: 100%; height: auto;" />
              </div>\n`
          break
        case 'button':
          const buttonUrl = block.buttonUrl || '#'
          html += `              <div style="text-align: center; margin: 20px 0;">
                <a href="${buttonUrl}" style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                  ${block.content}
                </a>
              </div>\n`
          break
        case 'qrcode':
          html += `              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; padding: 20px; background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px;">
                  <img src="{qrCodeUrl}" alt="Your QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;" />
                </div>
              </div>\n`
          break
      }
    })

    html += `            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    return html
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const htmlToSave = showCode ? customHtml : generateHtml()
      
      const response = await fetch(`/api/events/${eventId}/email-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: htmlToSave }),
      })

      if (!response.ok) throw new Error('Failed to save template')

      toast.success('Email template saved successfully!')
    } catch (error) {
      toast.error('Failed to save template. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const parseHtmlToBlocks = (html: string): TemplateBlock[] => {
    const blocks: TemplateBlock[] = []
    
    // Simple parser - looks for our specific patterns
    // Text blocks: <p ...>content</p>
    const textMatches = html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)
    for (const match of textMatches) {
      const content = match[1].trim()
      if (content && !content.includes('<img')) {
        blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'text',
          content: content,
          styles: {},
        })
      }
    }
    
    // Logo blocks: look for logo-specific divs
    const logoMatches = html.matchAll(/<div[^>]*text-align: center[^>]*>[\s]*<img src="([^"]+)" alt="Event Logo"/g)
    for (const match of logoMatches) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: 'logo',
        content: 'Logo',
        imageUrl: match[1],
        styles: {},
      })
    }
    
    // QR code blocks
    if (html.includes('{qrCodeUrl}')) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random()}`,
        type: 'qrcode',
        content: 'QR Code',
        styles: {},
      })
    }
    
    // Button blocks: <a href="..." style="...button styles...">text</a>
    const buttonMatches = html.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)
    for (const match of buttonMatches) {
      const href = match[1]
      const text = match[2].trim()
      if (href !== '#' || text) {
        blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          type: 'button',
          content: text,
          buttonUrl: href,
          styles: {},
        })
      }
    }
    
    return blocks
  }

  const loadDefaultTemplate = () => {
    setBlocks([
      {
        id: 'greeting',
        type: 'text',
        content: 'Hi {attendeeName},',
      },
      {
        id: 'intro',
        type: 'text',
        content: 'Your registration for <strong>{eventName}</strong> has been accepted!',
      },
      {
        id: 'qr',
        type: 'qrcode',
        content: 'QR Code',
      },
      {
        id: 'closing',
        type: 'text',
        content: 'We look forward to seeing you at the event!',
      },
    ])
  }

  const getPreviewHtml = () => {
    const html = showCode ? customHtml : generateHtml()
    return html
      .replace(/{attendeeName}/g, 'John Doe')
      .replace(/{eventName}/g, 'Sample Event')
      .replace(/{eventDate}/g, 'December 15, 2025')
      .replace(/{eventLocation}/g, 'Convention Center')
      .replace(/{qrCodeUrl}/g, 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SAMPLE')
      .replace(/{registrationId}/g, 'REG-12345')
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          <h2 className="font-semibold">Email Template Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
              showCode ? 'bg-primary text-white' : 'bg-white border'
            }`}
          >
            <Code className="w-4 h-4" />
            {showCode ? 'Visual' : 'Code'}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
              showPreview ? 'bg-primary text-white' : 'bg-white border'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {!showPreview && (
          <div className="flex-1 p-6 overflow-auto">
            {!showCode ? (
              <>
                {/* Visual Editor */}
                {blocks.length === 0 ? (
                  <div className="text-center py-16">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Start Building Your Email</h3>
                    <p className="text-muted-foreground mb-6">
                      Add blocks to create your custom email template
                    </p>
                    <button
                      onClick={loadDefaultTemplate}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center gap-2 mx-auto hover:from-blue-700 hover:to-purple-700"
                    >
                      <Wand2 className="w-5 h-5" />
                      Load Default Template
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks.map(block => (
                      <div key={block.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground capitalize">
                            {block.type} Block
                          </span>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                        {block.type === 'qrcode' ? (
                          <div className="text-center p-4 bg-muted rounded">
                            <p className="text-sm text-muted-foreground">
                              QR Code will be inserted here automatically
                            </p>
                          </div>
                        ) : block.type === 'logo' ? (
                          <div className="space-y-3">
                            {block.imageUrl ? (
                              <div className="relative inline-block">
                                <img
                                  src={block.imageUrl}
                                  alt="Logo"
                                  className="max-w-[200px] h-auto border rounded"
                                />
                                <button
                                  onClick={() => clearImage(block.id)}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : eventLogoUrl ? (
                              <div>
                                <div className="relative inline-block mb-2">
                                  <img
                                    src={eventLogoUrl}
                                    alt="Event Logo"
                                    className="max-w-[200px] h-auto border rounded"
                                  />
                                </div>
                                <p className="text-sm text-muted-foreground">Using event logo (you can upload a different one)</p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No logo available. Upload one below.</p>
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                ref={(el) => {
                                  if (el) fileInputRefs.current.set(block.id, el)
                                }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(block.id, file)
                                }}
                                className="hidden"
                                id={`logo-${block.id}`}
                              />
                              <button
                                onClick={() => document.getElementById(`logo-${block.id}`)?.click()}
                                disabled={uploadingImages.has(block.id)}
                                className="px-4 py-2 border border-dashed rounded-lg hover:bg-muted flex items-center gap-2 disabled:opacity-50"
                              >
                                <Upload className="w-4 h-4" />
                                {uploadingImages.has(block.id) ? 'Uploading...' : block.imageUrl ? 'Change Logo' : 'Upload Logo'}
                              </button>
                            </div>
                          </div>
                        ) : block.type === 'image' ? (
                          <div className="space-y-3">
                            {block.imageUrl && (
                              <div className="relative inline-block">
                                <img
                                  src={block.imageUrl}
                                  alt="Uploaded"
                                  className="max-w-full h-auto border rounded"
                                />
                                <button
                                  onClick={() => clearImage(block.id)}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                ref={(el) => {
                                  if (el) fileInputRefs.current.set(block.id, el)
                                }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(block.id, file)
                                }}
                                className="hidden"
                                id={`image-${block.id}`}
                              />
                              <button
                                onClick={() => document.getElementById(`image-${block.id}`)?.click()}
                                disabled={uploadingImages.has(block.id)}
                                className="px-4 py-2 border border-dashed rounded-lg hover:bg-muted flex items-center gap-2 disabled:opacity-50"
                              >
                                <Upload className="w-4 h-4" />
                                {uploadingImages.has(block.id) ? 'Uploading...' : block.imageUrl ? 'Change Image' : 'Upload Image'}
                              </button>
                              <p className="text-xs text-muted-foreground mt-1">Recommended: Max 5MB</p>
                            </div>
                          </div>
                        ) : block.type === 'button' ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Button text..."
                            />
                            <input
                              type="url"
                              value={block.buttonUrl || ''}
                              onChange={(e) => updateBlockUrl(block.id, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Button URL (e.g., https://example.com)"
                            />
                          </div>
                        ) : (
                          <textarea
                            data-block-id={block.id}
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                            onFocus={(e) => setActiveTextarea(e.target)}
                            rows={block.type === 'text' ? 3 : 1}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={`Enter ${block.type} content...`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Block Buttons */}
                <div className="mt-6 flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => addBlock('logo')}
                    className="px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    + Logo
                  </button>
                  <button
                    onClick={() => addBlock('text')}
                    className="px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    + Text
                  </button>
                  <button
                    onClick={() => addBlock('image')}
                    className="px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    + Image
                  </button>
                  <button
                    onClick={() => addBlock('button')}
                    className="px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    + Button
                  </button>
                  <button
                    onClick={() => addBlock('qrcode')}
                    className="px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    + QR Code
                  </button>
                  
                  {/* Insert Variable Dropdown */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setShowVariableMenu(showVariableMenu === 'visual' ? null : 'visual')}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Insert Variable
                    </button>
                    
                    {showVariableMenu === 'visual' && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowVariableMenu(null)}
                        />
                        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                          <div className="p-3">
                            <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-2">
                              Click to insert:
                            </div>
                            {AVAILABLE_VARIABLES.map((variable) => (
                              <button
                                key={variable.name}
                                onClick={() => insertVariable(variable.name)}
                                className="w-full text-left px-3 py-2 hover:bg-muted rounded flex flex-col gap-1 mb-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{variable.label}</span>
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {`{${variable.name}}`}
                                  </code>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {variable.description}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Variables Help */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold mb-2">Available Variables:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p><code className="bg-white dark:bg-gray-800 px-1 rounded">{'{attendeeName}'}</code> - Attendee's name</p>
                    <p><code className="bg-white dark:bg-gray-800 px-1 rounded">{'{eventName}'}</code> - Event name</p>
                    <p><code className="bg-white dark:bg-gray-800 px-1 rounded">{'{eventDate}'}</code> - Event date</p>
                    <p><code className="bg-white dark:bg-gray-800 px-1 rounded">{'{eventLocation}'}</code> - Event location</p>
                    <p><code className="bg-white dark:bg-gray-800 px-1 rounded">{'{qrCodeUrl}'}</code> - QR code image URL</p>
                    <p><code className="bg-white dark:bg-gray-800 px-1 rounded">{'{registrationId}'}</code> - Registration ID</p>
                  </div>
                </div>
              </>
            ) : (
              /* Code Editor */
              <div>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  onFocus={(e) => setActiveTextarea(e.target)}
                  className="w-full h-[600px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter custom HTML template..."
                />
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="flex-1 p-6 overflow-auto bg-muted">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <iframe
                  srcDoc={getPreviewHtml()}
                  className="w-full h-[800px] border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getDefaultContent(type: TemplateBlock['type']): string {
  switch (type) {
    case 'text':
      return 'Enter your text here...'
    case 'logo':
      return 'Event Logo'
    case 'image':
      return ''
    case 'button':
      return 'Click Here'
    case 'qrcode':
      return 'QR Code'
    default:
      return ''
  }
}
