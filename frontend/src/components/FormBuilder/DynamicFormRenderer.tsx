import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export type FieldType = 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'DATE' | 'BOOLEAN';

export interface FieldDefinition {
  id: string;
  formId: string;
  fieldName: string;
  fieldType: FieldType;
  required: boolean;
  order: number;
  options?: Array<{ label: string; value: string }>;
}

export interface FormDefinition {
  id: string;
  name: string;
  description?: string;
  version?: number;
  fields: FieldDefinition[];
}

interface DynamicFormRendererProps {
  formId: string;
  submitLabel?: string;
  headerIcon?: React.ReactNode;
  headerCaption?: string;
  onSubmit?: (payload: {
    formDefinition: FormDefinition;
    values: Record<string, string | boolean>;
  }) => Promise<void>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  formId,
  submitLabel,
  headerIcon,
  headerCaption,
  onSubmit
}) => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFormDefinition = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse<FormDefinition>>(`/forms/${formId}`);
        if (isMounted) {
          setFormDefinition(response.data.data);
          setValues({});
          setFieldErrors({});
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load form definition.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFormDefinition();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const sortedFields = useMemo(() => {
    return [...(formDefinition?.fields || [])].sort((a, b) => a.order - b.order);
  }, [formDefinition]);

  const completion = useMemo(() => {
    const requiredFields = sortedFields.filter((field) => field.required);
    if (requiredFields.length === 0) {
      return { completed: 0, total: 0, percent: 0 };
    }

    const completed = requiredFields.filter((field) => {
      const value = values[field.id];
      if (field.fieldType === 'BOOLEAN') {
        return Boolean(value);
      }
      return value !== undefined && value !== '';
    }).length;

    return {
      completed,
      total: requiredFields.length,
      percent: Math.round((completed / requiredFields.length) * 100)
    };
  }, [sortedFields, values]);

  const handleChange = (fieldId: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => ({ ...prev, [fieldId]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    sortedFields.forEach((field) => {
      const value = values[field.id];
      if (field.required) {
        if (field.fieldType === 'BOOLEAN') {
          if (!value) {
            nextErrors[field.id] = `${field.fieldName} is required`;
          }
        } else if (value === undefined || value === '') {
          nextErrors[field.id] = `${field.fieldName} is required`;
        }
      }
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    if (!formDefinition) {
      setError('Form definition is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ formDefinition, values });
      } else {
        const payload = {
          formId,
          values
        };

        await api.post('/assets', payload);
      }
      setError(null);
    } catch (err) {
      setError('Failed to submit form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-slate-200"></div>
          <div className="h-4 w-2/3 rounded bg-slate-200"></div>
          <div className="h-10 w-full rounded bg-slate-100"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (!formDefinition) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Form definition not found.
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {headerIcon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              {headerIcon}
            </div>
          )}
          <div>
            {headerCaption && (
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {headerCaption}
              </p>
            )}
            <h2 className="text-xl font-semibold text-[var(--cc-navy)]">
              {formDefinition.name}
            </h2>
          </div>
        </div>
        {formDefinition.description && (
          <p className="mt-2 text-sm text-slate-600">{formDefinition.description}</p>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completion</span>
            <span>
              {completion.completed}/{completion.total || 0} required fields
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[var(--cc-accent)] transition-all"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {sortedFields.map((field) => {
          const value = values[field.id];
          const errorMessage = fieldErrors[field.id];
          const hasValue = field.fieldType === 'BOOLEAN'
            ? Boolean(value)
            : value !== undefined && value !== '';
          const borderClass = errorMessage
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : hasValue
            ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200'
            : 'border-slate-300 focus:border-[var(--cc-accent)] focus:ring-blue-100';
          const labelClass = hasValue
            ? '-top-2 text-xs text-slate-600'
            : 'top-3 text-sm text-slate-500';

          return (
            <div key={field.id} className="space-y-2">
              {field.fieldType === 'TEXT' && (
                <div className="relative">
                  <input
                    type="text"
                    value={(value as string) || ''}
                    onChange={(event) => handleChange(field.id, event.target.value)}
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 pb-2 pt-4 text-sm text-slate-800 outline-none transition ${borderClass}`}
                  />
                  <label
                    className={`pointer-events-none absolute left-3 bg-white px-1 transition-all ${labelClass}`}
                  >
                    {field.fieldName}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                </div>
              )}

              {field.fieldType === 'NUMBER' && (
                <div className="relative">
                  <input
                    type="number"
                    value={(value as string) || ''}
                    onChange={(event) => handleChange(field.id, event.target.value)}
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 pb-2 pt-4 text-sm text-slate-800 outline-none transition ${borderClass}`}
                  />
                  <label
                    className={`pointer-events-none absolute left-3 bg-white px-1 transition-all ${labelClass}`}
                  >
                    {field.fieldName}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                </div>
              )}

              {field.fieldType === 'DATE' && (
                <div className="relative">
                  <input
                    type="date"
                    value={(value as string) || ''}
                    onChange={(event) => handleChange(field.id, event.target.value)}
                    className={`w-full rounded-lg border px-3 pb-2 pt-4 text-sm text-slate-800 outline-none transition ${borderClass}`}
                  />
                  <label
                    className={`pointer-events-none absolute left-3 bg-white px-1 transition-all ${labelClass}`}
                  >
                    {field.fieldName}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                </div>
              )}

              {field.fieldType === 'DROPDOWN' && (
                <div className="relative">
                  <select
                    value={(value as string) || ''}
                    onChange={(event) => handleChange(field.id, event.target.value)}
                    className={`w-full appearance-none rounded-lg border px-3 pb-2 pt-4 text-sm text-slate-800 outline-none transition ${borderClass}`}
                  >
                    <option value="">Select an option</option>
                    {(field.options || []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label
                    className={`pointer-events-none absolute left-3 bg-white px-1 transition-all ${labelClass}`}
                  >
                    {field.fieldName}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                </div>
              )}

              {field.fieldType === 'BOOLEAN' && (
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => handleChange(field.id, event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span>
                    {field.fieldName}
                    {field.required && <span className="text-red-500"> *</span>}
                  </span>
                </label>
              )}

              {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
              {!errorMessage && hasValue && field.fieldType !== 'BOOLEAN' && (
                <p className="text-xs text-emerald-600">Looks good.</p>
              )}
            </div>
          );
        })}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">All required fields must be completed.</p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[var(--cc-accent)] to-[#2563eb] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            )}
            {isSubmitting ? 'Submitting...' : submitLabel || 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};
