// Asset Types and Interfaces

import type { PaginatedResponse, ApiResponse } from './formTypes.js';

export interface AssetFieldValueInput {
  fieldId: string;
  dataKey: string;
  value: string | number | boolean | null;
}

export interface CreateAssetRequest {
  formId: string;
  formVersion: number;
  assetType: string;
  fieldValues: AssetFieldValueInput[];
}

export interface AssetFieldValueDTO {
  id: string;
  fieldId: string;
  dataKey: string;
  value: string | null;
  fieldName?: string;
  fieldType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetRecordDTO {
  id: string;
  formId: string;
  formVersion: number;
  assetType: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  fieldValues?: AssetFieldValueDTO[];
}

export interface AssetDetailDTO extends AssetRecordDTO {
  formTemplate?: {
    id: string;
    name: string;
    version: number;
    status: string;
  };
}

export interface AssetListQuery {
  page?: string;
  limit?: string;
  assetType?: string;
  formId?: string;
}

export type AssetResponse<T> = ApiResponse<T>;
export type AssetPaginatedResponse<T> = PaginatedResponse<T>;
