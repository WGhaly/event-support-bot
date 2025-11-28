'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, GripVertical, Trash2, Save } from 'lucide-react'

type FieldType = 'email' | 'phone' | 'text' | 'textarea' | 'file' | 'dropdown' | 'checkbox' | 'radio'

type FormField = {
  id: string
  label: string
  fieldType: FieldType
  placeholder: string | null
  helpText: string | null
  isRequired: boolean
  options: string | null
  order: number
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'file', label: 'File Upload' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'radio', label: 'Radio Buttons' },
]

export default function FormBuilder({
  eventId,
  existingFields,
}: {
  eventId: string
  existingFields: FormField[]
}) {
  const router = useRouter()
  const [fields, setFields] = useState<FormField[]>(existingFields)
  const [isSaving, setIsSaving] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      fieldType: 'text',
      placeholder: null,
      helpText: null,
      isRequired: false,
      options: null,
      order: fields.length,
    }
    setFields([...fields, newField])
    setEditingField(newField.id)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id).map((f, idx) => ({ ...f, order: idx })))
  }

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === fields.length - 1) return

    const newFields = [...fields]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]]
    
    setFields(newFields.map((f, idx) => ({ ...f, order: idx })))
  }

  const saveForm = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${eventId}/form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      })

      if (!response.ok) throw new Error('Failed to save form')

      router.refresh()
      alert('Form saved successfully!')
    } catch (error) {
      alert('Failed to save form. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Builder */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Form Fields</h2>
          <div className="flex gap-2">
            <button
              onClick={addField}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
            <button
              onClick={saveForm}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No fields yet</p>
            <button
              onClick={addField}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Field
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white dark:bg-gray-800 border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <button
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Field Content */}
                  <div className="flex-1 space-y-3">
                    {editingField === field.id ? (
                      <>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Field Label"
                        />
                        <select
                          value={field.fieldType}
                          onChange={(e) => updateField(field.id, { fieldType: e.target.value as FieldType })}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          {FIELD_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value || null })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Placeholder (optional)"
                        />
                        <input
                          type="text"
                          value={field.helpText || ''}
                          onChange={(e) => updateField(field.id, { helpText: e.target.value || null })}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Help text (optional)"
                        />
                        {['dropdown', 'checkbox', 'radio'].includes(field.fieldType) && (
                          <textarea
                            value={field.options || ''}
                            onChange={(e) => updateField(field.id, { options: e.target.value || null })}
                            className="w-full px-3 py-2 border rounded-lg resize-none"
                            rows={3}
                            placeholder='Options (one per line or JSON array: ["Option 1", "Option 2"])'
                          />
                        )}
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(e) => updateField(field.id, { isRequired: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Required field</span>
                        </label>
                        <button
                          onClick={() => setEditingField(null)}
                          className="text-sm text-primary hover:underline"
                        >
                          Done Editing
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {field.label}
                              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Type: {FIELD_TYPES.find(t => t.value === field.fieldType)?.label}
                            </p>
                          </div>
                        </div>
                        {field.helpText && (
                          <p className="text-sm text-muted-foreground">{field.helpText}</p>
                        )}
                        <button
                          onClick={() => setEditingField(field.id)}
                          className="text-sm text-primary hover:underline"
                        >
                          Edit Field
                        </button>
                      </>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteField(field.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="border rounded-lg p-6 bg-muted/50">
            <h3 className="font-semibold mb-4">Registration Form</h3>
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add fields to see preview</p>
            ) : (
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-1">
                      {field.label}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.fieldType === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder || ''}
                        className="w-full px-3 py-2 border rounded text-sm resize-none"
                        rows={3}
                        disabled
                      />
                    ) : field.fieldType === 'dropdown' ? (
                      <select className="w-full px-3 py-2 border rounded text-sm" disabled>
                        <option>Select option...</option>
                      </select>
                    ) : field.fieldType === 'checkbox' || field.fieldType === 'radio' ? (
                      <div className="text-sm text-muted-foreground">
                        Multiple choice options
                      </div>
                    ) : (
                      <input
                        type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
                        placeholder={field.placeholder || ''}
                        className="w-full px-3 py-2 border rounded text-sm"
                        disabled
                      />
                    )}
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
