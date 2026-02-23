import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Cpu,
  Key,
  Network,
  Server,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { DynamicFormRenderer, type FormDefinition } from '../components/FormBuilder/DynamicFormRenderer';
import { useToast } from '../context/ToastContext';

interface FormListResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description?: string;
    version?: number;
  }>;
}

interface AssetFieldValue {
  fieldId: string;
  dataKey: string;
  value: string | boolean;
}

interface AssetCreatePayload {
  formId: string;
  formVersion: number;
  assetType: string;
  fieldValues: AssetFieldValue[];
}

class AddAssetErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-red-600">
          Something went wrong while rendering the asset form.
        </div>
      );
    }

    return this.props.children;
  }
}

const assetTypes = [
  { label: 'Server', icon: Server },
  { label: 'Sensor', icon: Cpu },
  { label: 'Vehicle', icon: Car },
  { label: 'Network Equipment', icon: Network },
  { label: 'Software License', icon: Key }
];
const assetListRoute = '/assets';

const AddAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const [assetType, setAssetType] = useState('');
  const [formId, setFormId] = useState<string | null>(null);
  const [formLookupError, setFormLookupError] = useState<string | null>(null);
  const [formNotFoundMessage, setFormNotFoundMessage] = useState<string | null>(null);
  const [formLookupLoading, setFormLookupLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAssetTypes, setShowAssetTypes] = useState(false);
  const { showToast } = useToast();

  const themeStyle = {
    '--cc-navy': '#1e293b',
    '--cc-steel': '#475569',
    '--cc-accent': '#3b82f6',
    '--cc-success': '#10b981'
  } as React.CSSProperties;

  const onSelectAssetType = useCallback(async (value: string) => {
    setAssetType(value);
    setFormId(null);
    setSubmitError(null);
    setFormNotFoundMessage(null);

    if (!value) {
      setFormLookupError(null);
      return;
    }

    setFormLookupLoading(true);
    setFormLookupError(null);
    try {
      const response = await api.get<FormListResponse>('/forms', {
        params: { name: value }
      });
      const match = response.data.data.find((form) => form.name.toLowerCase() === value.toLowerCase());

      if (!match) {
        setFormNotFoundMessage('No form template found. Please create one first.');
        return;
      }

      setFormId(match.id);
    } catch (err) {
      setFormLookupError('Failed to load form template.');
    } finally {
      setFormLookupLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async ({ formDefinition, values }: { formDefinition: FormDefinition; values: Record<string, string | boolean> }) => {
      setSubmitError(null);
      const fieldValues = formDefinition.fields.map((field) => ({
        fieldId: field.id,
        dataKey: field.fieldName,
        value: values[field.id] ?? ''
      }));

      const payload: AssetCreatePayload = {
        formId: formDefinition.id,
        formVersion: formDefinition.version ?? 1,
        assetType,
        fieldValues
      };

      await api.post('/assets', payload);
      showToast('success', 'Asset created successfully.');
      setTimeout(() => navigate(assetListRoute), 1200);
    },
    [assetType, navigate, showToast]
  );

  const assetOptions = useMemo(() => assetTypes, []);
  const selectedAsset = assetOptions.find((option) => option.label === assetType);
  const SelectedIcon = selectedAsset?.icon || Server;

  return (
    <div
      className="min-h-screen bg-slate-50 px-4 pb-12 pt-8 text-[var(--cc-navy)] sm:px-6 lg:px-10"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif', ...themeStyle }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <nav className="text-xs text-[var(--cc-steel)]">
                Assets <span className="px-1">&gt;</span> Add Asset
              </nav>
              <h1
                className="mt-2 text-2xl font-semibold"
                style={{ fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
              >
                Asset Intake
              </h1>
              <p className="mt-1 text-sm text-[var(--cc-steel)]">
                Choose an asset type and capture critical operational metadata.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-[var(--cc-steel)]">
              <ShieldCheck size={16} className="text-[var(--cc-success)]" />
              Secure intake workflow enabled
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAssetTypes((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium sm:hidden"
            >
              {assetType || 'Select asset type'}
              <span className="text-[var(--cc-steel)]">{showAssetTypes ? 'Hide' : 'Show'}</span>
            </button>

            <div
              className={`${showAssetTypes ? 'grid' : 'hidden'} mt-4 grid-cols-1 gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-3`}
            >
              {assetOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = assetType === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      setShowAssetTypes(false);
                      onSelectAssetType(option.label);
                    }}
                    className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                      isSelected
                        ? 'border-[var(--cc-accent)] bg-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                        isSelected
                          ? 'border-blue-200 bg-white text-[var(--cc-accent)]'
                          : 'border-slate-200 bg-slate-50 text-[var(--cc-steel)]'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--cc-navy)]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--cc-steel)]">Track key specifications</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {formLookupLoading && (
              <p className="mt-4 text-sm text-[var(--cc-steel)]">Loading form template...</p>
            )}
            {formLookupError && (
              <p className="mt-4 text-sm text-red-600">{formLookupError}</p>
            )}
            {formNotFoundMessage && (
              <p className="mt-4 text-sm text-amber-600">{formNotFoundMessage}</p>
            )}
            {submitError && (
              <p className="mt-4 text-sm text-red-600">{submitError}</p>
            )}
          </div>
        </div>

        {formId && (
          <AddAssetErrorBoundary>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[var(--cc-accent)]">
                    <SelectedIcon size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cc-steel)]">
                    {assetType || 'Asset'} Form
                  </p>
                  <h2
                    className="text-lg font-semibold"
                    style={{ fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                  >
                    Command Center Intake
                  </h2>
                </div>
              </div>

              <DynamicFormRenderer
                formId={formId}
                submitLabel="Create Asset"
                headerIcon={<SelectedIcon size={18} />}
                headerCaption={assetType ? `${assetType} template` : 'Asset template'}
                onSubmit={async (payload) => {
                  try {
                    await handleSubmit(payload);
                  } catch (err) {
                    setSubmitError('Failed to create asset.');
                    showToast('error', 'Failed to create asset.');
                  }
                }}
              />
            </div>
          </AddAssetErrorBoundary>
        )}
      </div>

    </div>
  );
};

export default AddAssetPage;
