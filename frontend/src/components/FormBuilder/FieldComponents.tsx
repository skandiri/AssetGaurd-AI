import React from 'react';
import type { FormField } from '../../types/formBuilderTypes';

interface FieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

export const TextInputField: React.FC<FieldProps> = ({ field, value, onChange, error }) => {
  const validation = field.validation || {};
  const isMultiline = Boolean(field.uiProperties?.multiline);
  const fieldId = `text-${field.fieldName}`;
  
  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label || field.fieldName}
        {field.required && <span className="text-red-600">*</span>}
      </label>
      {isMultiline ? (
        <textarea
          id={fieldId}
          title={field.label || field.fieldName}
          aria-label={field.label || field.fieldName}
          value={value || field.uiProperties?.defaultValue || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.uiProperties?.placeholder || `Enter ${field.label || field.fieldName}`}
          maxLength={validation.maxLength}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
      ) : (
        <input
          id={fieldId}
          type="text"
          title={field.label || field.fieldName}
          aria-label={field.label || field.fieldName}
          value={value || field.uiProperties?.defaultValue || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.uiProperties?.placeholder || `Enter ${field.label || field.fieldName}`}
          maxLength={validation.maxLength}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
      )}
      {field.uiProperties?.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.uiProperties.helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const NumberInputField: React.FC<FieldProps> = ({ field, value, onChange, error }) => {
  const validation = field.validation || {};
  const fieldId = `number-${field.fieldName}`;

  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label || field.fieldName}
        {field.required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={fieldId}
        type="number"
        title={field.label || field.fieldName}
        aria-label={field.label || field.fieldName}
        value={value || field.uiProperties?.defaultValue || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={field.uiProperties?.placeholder || `Enter ${field.label || field.fieldName}`}
        min={validation.min}
        max={validation.max}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {field.uiProperties?.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.uiProperties.helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const DropdownField: React.FC<FieldProps> = ({ field, value, onChange, error }) => {
  const fieldId = `dropdown-${field.fieldName}`;
  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label || field.fieldName}
        {field.required && <span className="text-red-600">*</span>}
      </label>
      <select
        id={fieldId}
        title={field.label || field.fieldName}
        aria-label={field.label || field.fieldName}
        value={value || field.uiProperties?.defaultValue || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
      >
        <option value="">{field.uiProperties?.placeholder || 'Select an option'}</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.uiProperties?.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.uiProperties.helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const DatePickerField: React.FC<FieldProps> = ({ field, value, onChange, error }) => {
  const fieldId = `date-${field.fieldName}`;
  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-2">
        {field.label || field.fieldName}
        {field.required && <span className="text-red-600">*</span>}
      </label>
      <input
        id={fieldId}
        type="date"
        title={field.label || field.fieldName}
        aria-label={field.label || field.fieldName}
        value={value || field.uiProperties?.defaultValue || ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {field.uiProperties?.helpText && (
        <p className="mt-1 text-sm text-gray-500">{field.uiProperties.helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const CheckboxField: React.FC<FieldProps> = ({ field, value, onChange, error }) => {
  const isChecked = value === 'true' || value === 'on' || value === '1';
  const fieldId = `checkbox-${field.fieldName}`;

  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="flex items-center">
        <input
          id={fieldId}
          type="checkbox"
          title={field.label || field.fieldName}
          aria-label={field.label || field.fieldName}
          checked={isChecked}
          onChange={(e) => onChange?.(e.target.checked ? 'true' : 'false')}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm font-medium text-gray-700">
          {field.label || field.fieldName}
          {field.required && <span className="text-red-600">*</span>}
        </span>
      </label>
      {field.uiProperties?.helpText && (
        <p className="mt-1 ml-6 text-sm text-gray-500">{field.uiProperties.helpText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
