import React from 'react';
import type { ValidationRule, UIProperty, DropdownOption } from '../../types/formBuilderTypes';
import { FieldType, type FormField } from '../../types/formBuilderTypes';

interface FieldConfigPanelProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}

export const FieldConfigPanel: React.FC<FieldConfigPanelProps> = ({
  field,
  onUpdate,
  onDelete
}) => {
  const updateField = (changes: Partial<FormField>) => {
    onUpdate({ ...field, ...changes });
  };

  const updateValidation = (validation: ValidationRule) => {
    updateField({ validation });
  };

  const updateUIProperties = (uiProperties: UIProperty) => {
    updateField({ uiProperties });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-screen overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Field Configuration</h3>

        {/* Field Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name *
          </label>
          <input
            type="text"
            value={field.fieldName}
            onChange={(e) => updateField({ fieldName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., firstName"
          />
        </div>

        {/* Field Label */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Label
          </label>
          <input
            type="text"
            value={field.label || ''}
            onChange={(e) => updateField({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., First Name"
          />
        </div>

        {/* Field Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type
          </label>
          <select
            value={field.fieldType}
            onChange={(e) => updateField({ fieldType: e.target.value as FormField['fieldType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(FieldType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Required Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Required Field</span>
          </label>
        </div>
      </div>

      {/* Validation Rules */}
      <div className="border-t pt-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Validation Rules</h4>

        {(field.fieldType === FieldType.TEXT || field.fieldType === FieldType.NUMBER) && (
          <>
            {field.fieldType === FieldType.TEXT && (
              <>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">
                    Min Length
                  </label>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) =>
                      updateValidation({
                        ...field.validation,
                        minLength: e.target.value ? parseInt(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">
                    Max Length
                  </label>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) =>
                      updateValidation({
                        ...field.validation,
                        maxLength: e.target.value ? parseInt(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">
                    Regex Pattern
                  </label>
                  <input
                    type="text"
                    value={field.validation?.pattern || ''}
                    onChange={(e) =>
                      updateValidation({
                        ...field.validation,
                        pattern: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ^[a-z]+$"
                  />
                </div>
              </>
            )}

            {field.fieldType === FieldType.NUMBER && (
              <>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">
                    Minimum Value
                  </label>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) =>
                      updateValidation({
                        ...field.validation,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm text-gray-700 mb-1">
                    Maximum Value
                  </label>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) =>
                      updateValidation({
                        ...field.validation,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* UI Properties */}
      <div className="border-t pt-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">UI Properties</h4>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">
            Placeholder Text
          </label>
          <input
            type="text"
            value={field.uiProperties?.placeholder || ''}
            onChange={(e) =>
              updateUIProperties({
                ...field.uiProperties,
                placeholder: e.target.value
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">
            Help Text
          </label>
          <textarea
            value={field.uiProperties?.helpText || ''}
            onChange={(e) =>
              updateUIProperties({
                ...field.uiProperties,
                helpText: e.target.value
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Enter help text"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 mb-1">
            Default Value
          </label>
          <input
            type="text"
            value={field.uiProperties?.defaultValue || ''}
            onChange={(e) =>
              updateUIProperties({
                ...field.uiProperties,
                defaultValue: e.target.value
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter default value"
          />
        </div>
      </div>

      {/* Dropdown Options */}
      {field.fieldType === FieldType.DROPDOWN && (
        <div className="border-t pt-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Dropdown Options</h4>
          {field.options && field.options.length > 0 ? (
            <div className="space-y-2">
              {field.options.map((option: DropdownOption, index: number) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[index].label = e.target.value;
                      updateField({ options: newOptions });
                    }}
                    placeholder="Label"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...field.options!];
                      newOptions[index].value = e.target.value;
                      updateField({ options: newOptions });
                    }}
                    placeholder="Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      const newOptions = field.options!.filter((_: DropdownOption, i: number) => i !== index);
                      updateField({ options: newOptions });
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <button
            onClick={() => {
              const newOptions = [...(field.options || [])];
              newOptions.push({ label: '', value: '' });
              updateField({ options: newOptions });
            }}
            className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
          >
            + Add Option
          </button>
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
      >
        Delete Field
      </button>
    </div>
  );
};
