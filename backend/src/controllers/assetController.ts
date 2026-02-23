// Asset Controller - Handles asset record and values operations
import { Request, Response } from 'express';
import prisma from '../config/database.js';
import type {
  AssetFieldValueInput,
  CreateAssetRequest,
  AssetRecordDTO,
  AssetDetailDTO,
  AssetListQuery,
  AssetResponse,
  AssetPaginatedResponse
} from '../types/assetTypes.js';

const isEmptyValue = (value: unknown) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
};

const mapAssetFieldValue = (fieldValue: any): any => {
  return {
    id: fieldValue.id,
    fieldId: fieldValue.fieldId,
    dataKey: fieldValue.dataKey,
    value: fieldValue.value,
    fieldName: fieldValue.fieldDefinition?.fieldName,
    fieldType: fieldValue.fieldDefinition?.fieldType,
    createdAt: fieldValue.createdAt,
    updatedAt: fieldValue.updatedAt
  };
};

const mapAssetRecord = (asset: any): AssetDetailDTO => {
  return {
    id: asset.id,
    formId: asset.formId,
    formVersion: asset.formVersion,
    assetType: asset.assetType,
    createdBy: asset.createdBy,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
    formTemplate: asset.formTemplate
      ? {
          id: asset.formTemplate.id,
          name: asset.formTemplate.name,
          version: asset.formTemplate.version,
          status: asset.formTemplate.status
        }
      : undefined,
    fieldValues: asset.fieldValues ? asset.fieldValues.map(mapAssetFieldValue) : []
  };
};

/**
 * POST /api/assets - Create asset record with field values
 */
export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { formId, formVersion, assetType, fieldValues } = req.body as CreateAssetRequest;

    if (!formId || typeof formId !== 'string') {
      res.status(400).json({ success: false, error: 'formId is required' });
      return;
    }

    if (!assetType || typeof assetType !== 'string') {
      res.status(400).json({ success: false, error: 'assetType is required' });
      return;
    }

    if (typeof formVersion !== 'number') {
      res.status(400).json({ success: false, error: 'formVersion must be a number' });
      return;
    }

    if (!Array.isArray(fieldValues)) {
      res.status(400).json({ success: false, error: 'fieldValues must be an array' });
      return;
    }

    const formTemplate = await prisma.formTemplate.findUnique({
      where: { id: formId },
      include: { fieldDefinitions: true }
    });

    if (!formTemplate) {
      res.status(404).json({ success: false, error: 'Form template not found' });
      return;
    }

    const fieldMap = new Map(formTemplate.fieldDefinitions.map((field) => [field.id, field]));
    const providedFieldIds = new Set<string>();

    for (const value of fieldValues) {
      if (!value.fieldId || typeof value.fieldId !== 'string') {
        res.status(400).json({ success: false, error: 'Each fieldValue must include fieldId' });
        return;
      }

      if (providedFieldIds.has(value.fieldId)) {
        res.status(400).json({ success: false, error: 'Duplicate fieldId provided' });
        return;
      }

      if (!fieldMap.has(value.fieldId)) {
        res.status(400).json({ success: false, error: 'fieldId does not belong to the form' });
        return;
      }

      providedFieldIds.add(value.fieldId);
    }

    const missingRequiredFields = formTemplate.fieldDefinitions
      .filter((field) => field.required)
      .filter((field) => {
        const incoming = fieldValues.find((value) => value.fieldId === field.id);
        if (!incoming) return true;
        return isEmptyValue(incoming.value);
      });

    if (missingRequiredFields.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingRequiredFields.map((field) => field.fieldName).join(', ')}`
      });
      return;
    }

    const asset = await prisma.assetRecord.create({
      data: {
        formId,
        formVersion,
        assetType: assetType.trim(),
        createdBy: userId,
        fieldValues: {
          create: fieldValues.map((value) => {
            const fieldDef = fieldMap.get(value.fieldId);
            return {
              fieldId: value.fieldId,
              dataKey: value.dataKey || fieldDef?.fieldName || 'field',
              value: isEmptyValue(value.value) ? null : String(value.value)
            };
          })
        }
      },
      include: {
        formTemplate: true,
        fieldValues: {
          include: { fieldDefinition: true }
        }
      }
    });

    const response: AssetResponse<AssetDetailDTO> = {
      success: true,
      message: 'Asset created successfully',
      data: mapAssetRecord(asset)
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ success: false, error: 'Failed to create asset' });
  }
};

/**
 * GET /api/assets/:id - Get asset by ID with field values
 */
export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const asset = await prisma.assetRecord.findUnique({
      where: { id },
      include: {
        formTemplate: true,
        fieldValues: {
          include: { fieldDefinition: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!asset) {
      res.status(404).json({ success: false, error: 'Asset not found' });
      return;
    }

    const response: AssetResponse<AssetDetailDTO> = {
      success: true,
      data: mapAssetRecord(asset)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch asset' });
  }
};

/**
 * GET /api/assets - List assets with optional filters
 */
export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', assetType, formId } = req.query as AssetListQuery;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (assetType) {
      where.assetType = assetType;
    }
    if (formId) {
      where.formId = formId;
    }

    const [assets, total] = await Promise.all([
      prisma.assetRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          formTemplate: true
        }
      }),
      prisma.assetRecord.count({ where })
    ]);

    const response: AssetPaginatedResponse<AssetRecordDTO> = {
      success: true,
      data: assets.map((asset) => ({
        id: asset.id,
        formId: asset.formId,
        formVersion: asset.formVersion,
        assetType: asset.assetType,
        createdBy: asset.createdBy,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assets' });
  }
};
