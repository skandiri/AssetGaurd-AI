import React, { useState } from 'react';
import type { FormField } from '../../types/formBuilderTypes';
import { FieldType } from '../../types/formBuilderTypes';
import {
  TextInputField,
  NumberInputField,
  DropdownField,
  DatePickerField,
  CheckboxField
} from './FieldComponents';

interface FormPreviewProps {
  formName: string;
  formDescription?: string;
  fields: FormField[];
}

interface FormErrors {
  [fieldId: string]: string;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  formName,
  formDescription,
  fields
}) => {
  const [formValues, setFormValues] = useState<{ [fieldId: string]: string }>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (field: FormField, value: string): string | undefined => {
    if (field.required && !value) {
      return `${field.label || field.fieldName} is required`;
    }

    const validation = field.validation;
    if (!validation || !value) return undefined;

    if (field.fieldType === FieldType.TEXT) {
      if (validation.minLength && value.length < validation.minLength) {
        return `Minimum length is ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `Maximum length is ${validation.maxLength} characters`;
      }
      if (validation.pattern) {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            return `Invalid format`;
          }
        } catch (e) {
          return `Invalid validation pattern`;
        }
      }
    }

    if (field.fieldType === FieldType.NUMBER) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return `Must be a valid number`;
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return `Minimum value is ${validation.min}`;
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `Maximum value is ${validation.max}`;
      }
    }

    return undefined;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value
    }));

    // Clear error on change
    setErrors((prev) => ({
      ...prev,
      [fieldId]: ''
    }));
  };

  const handleBlur = (field: FormField) => {
    const value = formValues[field.id] || '';
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [field.id]: error
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    // Validate all fields
    fields.forEach((field) => {
      const value = formValues[field.id] || '';
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form is valid:', formValues);
      // In a real app, this would submit the form
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      field,
      value: formValues[field.id],
      onChange: (value: string) => handleFieldChange(field.id, value),
      error: errors[field.id],
      onBlur: () => handleBlur(field)
    };

    switch (field.fieldType) {
      case FieldType.TEXT:
        return <TextInputField key={field.id} {...commonProps} />;
      case FieldType.NUMBER:
        return <NumberInputField key={field.id} {...commonProps} />;
      case FieldType.DROPDOWN:
        return <DropdownField key={field.id} {...commonProps} />;
      case FieldType.DATE:
        return <DatePickerField key={field.id} {...commonProps} />;
      case FieldType.BOOLEAN:
        return <CheckboxField key={field.id} {...commonProps} />;
      default:
        return null;
    }
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{formName}</h2>
        {formDescription && (
          <p className="text-gray-600">{formDescription}</p>
        )}
      </div>

      {sortedFields.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No fields added yet. Add fields to preview the form.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {sortedFields.map((field) => renderField(field))}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Submit Form
          </button>
        </form>
      )}
    </div>
  );
};
