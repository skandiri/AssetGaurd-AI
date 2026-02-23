import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface AssetListItem {
  id: string;
  formId: string;
  formVersion: number;
  assetType: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface AssetFieldValue {
  id: string;
  fieldId: string;
  dataKey: string;
  value: string | null;
  fieldName?: string;
  fieldType?: string;
}

interface AssetDetail {
  id: string;
  assetType: string;
  createdAt: string;
  fieldValues: AssetFieldValue[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const assetTypes = ['All', 'Server', 'Sensor', 'Vehicle'];

const getAssetName = (asset: AssetDetail | null) => {
  if (!asset) return 'Unnamed Asset';
  const nameField = asset.fieldValues.find((field) =>
    field.dataKey.toLowerCase().includes('name')
  );
  return nameField?.value || 'Unnamed Asset';
};

const AssetListPage: React.FC = () => {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [assetDetails, setAssetDetails] = useState<Record<string, AssetDetail>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<PaginatedResponse<AssetListItem>>('/assets', {
          params: {
            page,
            limit: 10,
            assetType: typeFilter === 'All' ? undefined : typeFilter
          }
        });

        if (!isMounted) return;

        setAssets(response.data.data);
        setTotalPages(response.data.pagination.totalPages || 1);

        const detailRequests = response.data.data.map((asset) =>
          api.get<{ success: boolean; data: AssetDetail }>(`/assets/${asset.id}`)
        );

        const detailResponses = await Promise.all(detailRequests);
        if (!isMounted) return;

        const detailsMap: Record<string, AssetDetail> = {};
        detailResponses.forEach((detail) => {
          detailsMap[detail.data.data.id] = detail.data.data;
        });
        setAssetDetails(detailsMap);
      } catch (err) {
        if (isMounted) {
          const message = 'Failed to load assets.';
          setError(message);
          showToast('error', message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [page, typeFilter, showToast]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assets;

    return assets.filter((asset) => {
      const detail = assetDetails[asset.id];
      const assetName = getAssetName(detail).toLowerCase();
      const fieldText = detail?.fieldValues
        .map((field) => `${field.dataKey} ${field.value ?? ''}`.toLowerCase())
        .join(' ') || '';

      return (
        asset.assetType.toLowerCase().includes(query) ||
        assetName.includes(query) ||
        fieldText.includes(query)
      );
    });
  }, [assets, assetDetails, searchQuery]);

  const handlePrevious = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Assets</h1>
          <p className="mt-1 text-sm text-slate-600">Manage asset records and details.</p>
        </div>
        <Link
          to="/assets/add"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Add Asset
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">Asset Type</label>
          <select
            value={typeFilter}
            onChange={(event) => {
              setPage(1);
              setTypeFilter(event.target.value);
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 justify-end">
          <input
            type="search"
            placeholder="Search assets"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading assets...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No assets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Asset Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Asset Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Created Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Key Fields</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredAssets.map((asset) => {
                  const detail = assetDetails[asset.id] || null;
                  const keyFields = detail?.fieldValues.slice(0, 3) || [];

                  return (
                    <tr key={asset.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{asset.assetType}</td>
                      <td className="px-4 py-3">{getAssetName(detail)}</td>
                      <td className="px-4 py-3">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 text-xs text-slate-500">
                          {keyFields.length === 0
                            ? 'No field data'
                            : keyFields.map((field) => (
                                <div key={field.id}>
                                  {field.dataKey}: {field.value ?? '-'}
                                </div>
                              ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handlePrevious}
          disabled={page <= 1}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AssetListPage;
