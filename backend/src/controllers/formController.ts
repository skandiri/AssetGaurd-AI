// Form Controller - Handles form template and field operations
import { Request, Response } from 'express';
import prisma from '../config/database.js';
import {
  CreateFormRequest,
  UpdateFormRequest,
  CreateFieldRequest,
  UpdateFieldRequest,
  FormStatus,
  PaginationQuery,
  ApiResponse,
  FormTemplateDTO,
  FormDetailDTO,
  FieldDefinitionDTO,
  PaginatedResponse
} from '../types/formTypes.js';

// ==============================
// FORM TEMPLATE CONTROLLERS
// ==============================

/**
 * POST /api/forms - Create a new form template
 */
export const createFormTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, description, tenantId } = req.body as CreateFormRequest;
    const userId = (req as any).userId;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Form name is required and must be a non-empty string'
      });
      return;
    }

    const formTemplate = await prisma.formTemplate.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        createdBy: userId,
        tenantId
      },
      include: {
        fieldDefinitions: true
      }
    });

    const response: ApiResponse<FormTemplateDTO> = {
      success: true,
      message: 'Form template created successfully',
      data: mapFormTemplateToDTO(formTemplate, formTemplate.fieldDefinitions.length)
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating form template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create form template'
    });
  }
};

/**
 * GET /api/forms - List all forms with pagination
 */
export const getAllFormTemplates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, tenantId } = req.query as PaginationQuery;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = {};
    if (status && Object.values(FormStatus).includes(status as FormStatus)) {
      where.status = status;
    }
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [forms, total] = await Promise.all([
      prisma.formTemplate.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          fieldDefinitions: {
            select: { id: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.formTemplate.count({ where })
    ]);

    const mappedForms = forms.map(form =>
      mapFormTemplateToDTO(form, form.fieldDefinitions.length)
    );

    const response: PaginatedResponse<FormTemplateDTO> = {
      success: true,
      data: mappedForms,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forms'
    });
  }
};

/**
 * GET /api/forms/:id - Get form with all field definitions
 */
export const getFormTemplateById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const form = await prisma.formTemplate.findUnique({
      where: { id },
      include: {
        fieldDefinitions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!form) {
      res.status(404).json({
        success: false,
        error: 'Form template not found'
      });
      return;
    }

    const mappedFields = form.fieldDefinitions.map(field =>
      mapFieldToDTO(field)
    );

    const response: ApiResponse<FormDetailDTO> = {
      success: true,
      data: {
        ...mapFormTemplateToDTO(form, form.fieldDefinitions.length),
        fields: mappedFields
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch form template'
    });
  }
};

/**
 * PUT /api/forms/:id - Update form template
 */
export const updateFormTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body as UpdateFormRequest;

    // Verify form exists
    const existingForm = await prisma.formTemplate.findUnique({
      where: { id }
    });

    if (!existingForm) {
      res.status(404).json({
        success: false,
        error: 'Form template not found'
      });
      return;
    }

    // Validate status if provided
    if (status && !Object.values(FormStatus).includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${Object.values(FormStatus).join(', ')}`
      });
      return;
    }

    const updatedForm = await prisma.formTemplate.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      include: {
        fieldDefinitions: {
          select: { id: true }
        }
      }
    });

    const response: ApiResponse<FormTemplateDTO> = {
      success: true,
      message: 'Form template updated successfully',
      data: mapFormTemplateToDTO(updatedForm, updatedForm.fieldDefinitions.length)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update form template'
    });
  }
};

/**
 * DELETE /api/forms/:id - Archive form template
 */
export const deleteFormTemplate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existingForm = await prisma.formTemplate.findUnique({
      where: { id }
    });

    if (!existingForm) {
      res.status(404).json({
        success: false,
        error: 'Form template not found'
      });
      return;
    }

    // Archive instead of delete (soft delete)
    const archivedForm = await prisma.formTemplate.update({
      where: { id },
      data: {
        status: FormStatus.ARCHIVED,
        updatedAt: new Date()
      }
    });

    const response: ApiResponse<any> = {
      success: true,
      message: 'Form template archived successfully',
      data: { id: archivedForm.id, status: archivedForm.status }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive form template'
    });
  }
};

// ==============================
// FIELD DEFINITION CONTROLLERS
// ==============================

/**
 * POST /api/forms/:id/fields - Add field to form
 */
export const addFieldToForm = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: formId } = req.params;
    const fieldData = req.body as CreateFieldRequest;

    // Verify form exists
    const form = await prisma.formTemplate.findUnique({
      where: { id: formId }
    });

    if (!form) {
      res.status(404).json({
        success: false,
        error: 'Form template not found'
      });
      return;
    }

    // Validation
    if (!fieldData.fieldName || typeof fieldData.fieldName !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Field name is required and must be a string'
      });
      return;
    }

    if (!fieldData.fieldType || typeof fieldData.fieldType !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Field type is required'
      });
      return;
    }

    if (typeof fieldData.order !== 'number' || fieldData.order < 0) {
      res.status(400).json({
        success: false,
        error: 'Order must be a non-negative number'
      });
      return;
    }

    // Check for duplicate field names in this form
    const existingField = await prisma.fieldDefinition.findFirst({
      where: {
        formId,
        fieldName: fieldData.fieldName
      }
    });

    if (existingField) {
      res.status(400).json({
        success: false,
        error: 'Field with this name already exists in the form'
      });
      return;
    }

    const field = await prisma.fieldDefinition.create({
      data: {
        formId,
        fieldName: fieldData.fieldName.trim(),
        fieldType: fieldData.fieldType,
        required: fieldData.required ?? false,
        order: fieldData.order,
        validation: fieldData.validation ? JSON.stringify(fieldData.validation) : null,
        uiProperties: fieldData.uiProperties ? JSON.stringify(fieldData.uiProperties) : null,
        options: fieldData.options ? JSON.stringify(fieldData.options) : null
      }
    });

    const response: ApiResponse<FieldDefinitionDTO> = {
      success: true,
      message: 'Field added to form successfully',
      data: mapFieldToDTO(field)
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error adding field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add field to form'
    });
  }
};

/**
 * PUT /api/forms/:formId/fields/:fieldId - Update field definition
 */
export const updateField = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { formId, fieldId } = req.params;
    const updateData = req.body as UpdateFieldRequest;

    // Verify field exists and belongs to the form
    const field = await prisma.fieldDefinition.findUnique({
      where: { id: fieldId }
    });

    if (!field || field.formId !== formId) {
      res.status(404).json({
        success: false,
        error: 'Field not found in this form'
      });
      return;
    }

    // If changing field name, check for duplicates
    if (updateData.fieldName && updateData.fieldName !== field.fieldName) {
      const duplicateField = await prisma.fieldDefinition.findFirst({
        where: {
          formId,
          fieldName: updateData.fieldName,
          id: { not: fieldId }
        }
      });

      if (duplicateField) {
        res.status(400).json({
          success: false,
          error: 'Another field with this name already exists in the form'
        });
        return;
      }
    }

    const updatedField = await prisma.fieldDefinition.update({
      where: { id: fieldId },
      data: {
        ...(updateData.fieldName && { fieldName: updateData.fieldName.trim() }),
        ...(updateData.fieldType && { fieldType: updateData.fieldType }),
        ...(typeof updateData.required === 'boolean' && { required: updateData.required }),
        ...(typeof updateData.order === 'number' && { order: updateData.order }),
        ...(updateData.validation !== undefined && {
          validation: updateData.validation ? JSON.stringify(updateData.validation) : null
        }),
        ...(updateData.uiProperties !== undefined && {
          uiProperties: updateData.uiProperties ? JSON.stringify(updateData.uiProperties) : null
        }),
        ...(updateData.options !== undefined && {
          options: updateData.options ? JSON.stringify(updateData.options) : null
        }),
        updatedAt: new Date()
      }
    });

    const response: ApiResponse<FieldDefinitionDTO> = {
      success: true,
      message: 'Field updated successfully',
      data: mapFieldToDTO(updatedField)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update field'
    });
  }
};

/**
 * DELETE /api/forms/:formId/fields/:fieldId - Remove field from form
 */
export const deleteField = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { formId, fieldId } = req.params;

    // Verify field exists and belongs to the form
    const field = await prisma.fieldDefinition.findUnique({
      where: { id: fieldId }
    });

    if (!field || field.formId !== formId) {
      res.status(404).json({
        success: false,
        error: 'Field not found in this form'
      });
      return;
    }

    await prisma.fieldDefinition.delete({
      where: { id: fieldId }
    });

    const response: ApiResponse<any> = {
      success: true,
      message: 'Field deleted successfully',
      data: { id: fieldId }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting field:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete field'
    });
  }
};

// ==============================
// HELPER FUNCTIONS
// ==============================

function mapFormTemplateToDTO(
  form: any,
  fieldCount: number
): FormTemplateDTO {
  return {
    id: form.id,
    name: form.name,
    description: form.description,
    version: form.version,
    status: form.status,
    createdBy: form.createdBy,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    tenantId: form.tenantId,
    fieldCount
  };
}

function mapFieldToDTO(field: any): FieldDefinitionDTO {
  return {
    id: field.id,
    formId: field.formId,
    fieldName: field.fieldName,
    fieldType: field.fieldType,
    required: field.required,
    order: field.order,
    validation: field.validation ? JSON.parse(field.validation) : undefined,
    uiProperties: field.uiProperties ? JSON.parse(field.uiProperties) : undefined,
    options: field.options ? JSON.parse(field.options) : undefined,
    createdAt: field.createdAt,
    updatedAt: field.updatedAt
  };
}
