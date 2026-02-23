// Form Builder Types and Interfaces

export enum FormStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN'
}

// Request Bodies
export interface CreateFormRequest {
  name: string;
  description?: string;
  tenantId?: string;
}

export interface UpdateFormRequest {
  name?: string;
  description?: string;
  status?: FormStatus;
}

export interface CreateFieldRequest {
  fieldName: string;
  fieldType: FieldType;
  required?: boolean;
  order: number;
  validation?: Record<string, any>;
  uiProperties?: Record<string, any>;
  options?: Record<string, any>;
}

export interface UpdateFieldRequest {
  fieldName?: string;
  fieldType?: FieldType;
  required?: boolean;
  order?: number;
  validation?: Record<string, any>;
  uiProperties?: Record<string, any>;
  options?: Record<string, any>;
}

// Response DTO
export interface FormTemplateDTO {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  tenantId?: string;
  fieldCount?: number;
}

export interface FieldDefinitionDTO {
  id: string;
  formId: string;
  fieldName: string;
  fieldType: string;
  required: boolean;
  order: number;
  validation?: Record<string, any>;
  uiProperties?: Record<string, any>;
  options?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormDetailDTO extends FormTemplateDTO {
  fields: FieldDefinitionDTO[];
}

// Pagination
export interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  tenantId?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Authenticated Request
export interface AuthenticatedRequest {
  userId: number;
  email: string;
}
