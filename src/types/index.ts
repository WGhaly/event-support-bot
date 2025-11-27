// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: AppError
  meta: {
    timestamp: string
    requestId?: string
  }
}

export interface AppError {
  code: string
  message: string
  details?: unknown
  userMessage: string
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Template types
export interface Template {
  id: string
  projectId: string
  name: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  fields: TemplateField[]
  createdAt: Date
  updatedAt: Date
}

export interface TemplateField {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  textAlign: 'left' | 'center' | 'right'
  color: string
  rotation?: number
}

// Dataset types
export interface Dataset {
  id: string
  projectId: string
  name: string
  fileType: 'csv' | 'xlsx'
  rowCount: number
  columns: string[]
  data: Record<string, unknown>[]
  createdAt: Date
  updatedAt: Date
}

// Field mapping types
export interface FieldMapping {
  id: string
  templateId: string
  datasetId: string
  mappings: Record<string, string> // fieldId -> columnName
  createdAt: Date
  updatedAt: Date
}

// Export types
export interface BadgeExport {
  id: string
  projectId: string
  fieldMappingId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  badgeCount: number
  exportUrl?: string
  errorMessage?: string
  startedAt: Date
  completedAt?: Date
}

// Form validation types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  name?: string
}

export interface ProjectFormData {
  name: string
  description?: string
}

// User types
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}
