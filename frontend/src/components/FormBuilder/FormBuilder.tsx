import React, { useState, useEffect } from 'react';
import {
  AlignLeft,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Hash,
  Monitor,
  Plus,
  Sparkles,
  Tablet,
  Text,
  Eye,
  Smartphone
} from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormPreview } from './FormPreview';
import type { FormField, FieldType } from '../../types/formBuilderTypes';
import { FieldType as FieldTypeEnum } from '../../types/formBuilderTypes';
import { formBuilderAPI } from '../../services/formBuilderAPI';
import { useToast } from '../../context/ToastContext';

interface FormBuilderProps {
  formId?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ formId }) => {
  const {
    state,
    setFormName,
    setFormDescription,
    addField
  } = useFormBuilder();

  const [isSaving, setIsSaving] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [logicEnabled, setLogicEnabled] = useState(true);
  const [schemaRoles, setSchemaRoles] = useState({
    enterpriseAdmin: true,
    siteManager: false,
    fieldEngineer: false
  });
  const { showToast } = useToast();

  // Load form if formId is provided
  useEffect(() => {
    if (formId) {
      const loadForm = async () => {
        try {
          const form = await formBuilderAPI.getFormById(formId);
          setFormName(form.name);
          setFormDescription(form.description);
          // Load fields would require additional state management
        } catch (error) {
          console.error('Error loading form:', error);
        }
      };
      loadForm();
    }
  }, [formId]);

  const handleAddField = (
    fieldType: FieldType,
    overrides?: { label?: string; uiProperties?: FormField['uiProperties'] }
  ) => {
    try {
      addField({
        id: `field_${Date.now()}`,
        fieldName: `field_${Date.now()}`,
        fieldType,
        label: overrides?.label || '',
        required: false,
        order: state.fields.length,
        validation: {},
        uiProperties: overrides?.uiProperties || {},
        options: fieldType === FieldTypeEnum.DROPDOWN ? [{ label: '', value: '' }] : undefined
      });
      showToast('success', 'Field added successfully.');
    } catch (error) {
      showToast('error', 'Failed to add field.');
    }
  };

  const handleSaveForm = async () => {
    if (!state.formName.trim()) {
      showToast('warning', 'Form name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (formId) {
        // Update existing form
        await formBuilderAPI.updateForm(formId, {
          name: state.formName,
          description: state.formDescription
        });
      } else {
        // Create new form
        const newForm = await formBuilderAPI.createForm({
          name: state.formName,
          description: state.formDescription
        });
        // In a real app, would update the URL with the new formId
        console.log('Created form:', newForm);
      }
      showToast('success', 'Form saved successfully.');
    } catch (error) {
      console.error('Error saving form:', error);
      showToast('error', 'Failed to save form.');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldLibrary = [
    { type: FieldTypeEnum.TEXT, label: 'Text Field', icon: Text },
    { type: FieldTypeEnum.NUMBER, label: 'Number', icon: Hash },
    { type: FieldTypeEnum.DATE, label: 'Date Picker', icon: CalendarDays },
    { type: FieldTypeEnum.DROPDOWN, label: 'Drop Down', icon: ChevronDown },
    { type: FieldTypeEnum.BOOLEAN, label: 'Checkbox', icon: CheckSquare },
    { type: FieldTypeEnum.TEXT, label: 'Text Area', icon: AlignLeft, uiProperties: { multiline: true } }
  ];

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-50 text-slate-900">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow">
            <Sparkles size={14} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Form Engine Builder</p>
            <h2 className="text-lg font-semibold leading-tight text-slate-900">
              Governing User Input Schema
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setDeviceView('desktop')}
              aria-label="Switch to desktop view"
              title="Desktop view"
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] ${
                deviceView === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Monitor size={11} />
              Desktop
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              aria-label="Switch to tablet view"
              title="Tablet view"
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] ${
                deviceView === 'tablet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Tablet size={11} />
              Tablet
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              aria-label="Switch to mobile view"
              title="Mobile view"
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] ${
                deviceView === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Smartphone size={11} />
              Mobile
            </button>
          </div>
          <button 
            aria-label="Preview form"
            title="Preview form"
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-500"
          >
            <Eye size={11} />
            Preview
          </button>
          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="rounded-full bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-500 disabled:opacity-70"
          >
            {isSaving ? 'Publishing...' : 'Publish Schema'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Field Library */}
        <aside className="w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Field Library</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {fieldLibrary.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() =>
                    handleAddField(item.type as FieldType, {
                      label: item.label === 'Text Area' ? 'Text Area' : '',
                      uiProperties: item.uiProperties
                    })
                  }
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 px-3 py-4 text-center text-[11px] font-semibold uppercase text-slate-500 shadow-sm hover:border-indigo-200"
                >
                  <Icon size={18} className="text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Advanced Components
          </div>
          <div className="mt-3 space-y-3 text-[11px] font-semibold uppercase text-slate-400">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="h-4 w-4 rounded border border-slate-300 bg-white" />
              GPS Coordinates
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="h-4 w-4 rounded border border-slate-300 bg-white" />
              ID Verification
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-indigo-50 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Builder Tips
            </div>
            <p className="mt-2 text-[11px] text-indigo-500">
              Drag components onto the canvas. Use rules to build conditional logic.
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <section className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <input
              type="text"
              value={state.formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Untitled Asset Form"
              className="w-full text-2xl font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none"
            />
            <input
              type="text"
              value={state.formDescription || ''}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Define the schema for user data collection."
              className="mt-1 w-full text-[13px] text-slate-500 placeholder:text-slate-300 focus:outline-none"
            />
          </div>

          <div className="flex-1 bg-slate-50 p-10">
            {state.fields.length === 0 ? (
              <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
                <div className="mb-4 mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Plus size={18} />
                </div>
                <p className="text-sm font-semibold text-slate-400">Empty Canvas</p>
                <p className="mt-2 max-w-xs text-[12px] text-slate-300">
                  Drag and drop components from the library to start building your form.
                </p>
                <div className="mb-8" />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-2xl">
                <FormPreview
                  formName={state.formName || 'Untitled Asset Form'}
                  formDescription={state.formDescription}
                  fields={state.fields}
                />
              </div>
            )}
          </div>
        </section>

        {/* Global Logic */}
        <aside className="w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Global Logic</div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-slate-600">
              <span>Conditional Logic</span>
              <label className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={logicEnabled}
                  onChange={() => setLogicEnabled(!logicEnabled)}
                  aria-label="Toggle conditional logic"
                  title="Enable or disable conditional logic"
                  className="peer sr-only"
                />
                <div className="h-5 w-10 rounded-full bg-slate-200 transition peer-checked:bg-emerald-500" />
                <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5" />
              </label>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
              If [Field A] &gt; 10...
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-slate-600">Schema Permissions</p>
            <div className="mt-3 space-y-2 text-[11px] text-slate-500">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schemaRoles.enterpriseAdmin}
                  onChange={(e) =>
                    setSchemaRoles((prev) => ({ ...prev, enterpriseAdmin: e.target.checked }))
                  }
                />
                Enterprise Admin
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schemaRoles.siteManager}
                  onChange={(e) =>
                    setSchemaRoles((prev) => ({ ...prev, siteManager: e.target.checked }))
                  }
                />
                Site Manager
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schemaRoles.fieldEngineer}
                  onChange={(e) =>
                    setSchemaRoles((prev) => ({ ...prev, fieldEngineer: e.target.checked }))
                  }
                />
                Field Engineer
              </label>
            </div>
          </div>
          <button className="mt-4 w-full rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-3 text-[11px] font-semibold uppercase text-slate-400">
            + Add Global Rule
          </button>
        </aside>
      </div>
    </div>
  );
};
