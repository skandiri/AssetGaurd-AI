// Form Builder Types and Interfaces

// Field Types
export const FieldType = {
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  DROPDOWN: 'DROPDOWN',
  DATE: 'DATE',
  BOOLEAN: 'BOOLEAN'
} as const;

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface UIProperty {
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  width?: string;
  [key: string]: any;
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  fieldName: string;
  fieldType: FieldType;
  label?: string;
  required: boolean;
  order: number;
  validation?: ValidationRule;
  uiProperties?: UIProperty;
  options?: DropdownOption[];
}

export interface FormTemplate {
  id?: string;
  name: string;
  description?: string;
  fields: FormField[];
  version?: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormBuilderState {
  formName: string;
  formDescription: string;
  fields: FormField[];
  selectedFieldId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

export type FormBuilderAction =
  | { type: 'SET_FORM_NAME'; payload: string }
  | { type: 'SET_FORM_DESCRIPTION'; payload: string }
  | { type: 'ADD_FIELD'; payload: FormField }
  | { type: 'UPDATE_FIELD'; payload: FormField }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'REORDER_FIELDS'; payload: FormField[] }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'LOAD_FORM'; payload: FormTemplate }
  | { type: 'RESET' };
