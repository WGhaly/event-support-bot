'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormField = {
  id: string
  label: string
  fieldType: string
  placeholder: string | null
  helpText: string | null
  isRequired: boolean
  options: string | null
}

type Event = {
  id: string
  name: string
  slug: string
}

export default function RegistrationForm({
  event,
  formFields,
}: {
  event: Event
  formFields: FormField[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch(`/api/register/${event.slug}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      const data = await response.json()
      
      // Redirect to success page with registration ID
      router.push(`/register/${event.slug}/success?id=${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      name: field.id,
      required: field.isRequired,
      placeholder: field.placeholder || undefined,
      className: 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    }

    switch (field.fieldType) {
      case 'email':
        return <input {...commonProps} type="email" />
      
      case 'phone':
        return <input {...commonProps} type="tel" />
      
      case 'text':
        return <input {...commonProps} type="text" />
      
      case 'textarea':
        return <textarea {...commonProps} rows={4} className={`${commonProps.className} resize-none`} />
      
      case 'file':
        return <input {...commonProps} type="file" className="w-full" />
      
      case 'dropdown':
        const dropdownOptions = field.options ? JSON.parse(field.options) : []
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {dropdownOptions.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
        )
      
      case 'checkbox':
        const checkboxOptions = field.options ? JSON.parse(field.options) : []
        return (
          <div className="space-y-2">
            {checkboxOptions.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.id}
                  value={opt}
                  className="w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )
      
      case 'radio':
        const radioOptions = field.options ? JSON.parse(field.options) : []
        return (
          <div className="space-y-2">
            {radioOptions.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  required={field.isRequired}
                  className="w-4 h-4"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )
      
      default:
        return <input {...commonProps} type="text" />
    }
  }

  if (formFields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No registration form has been configured yet.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {formFields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="block text-sm font-medium mb-2">
            {field.label}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {field.helpText && (
            <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Register Now'}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        By registering, you agree to receive event-related communications.
      </p>
    </form>
  )
}
