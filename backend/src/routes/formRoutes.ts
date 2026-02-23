// Form Routes - API endpoints for form builder system
import { Router, Request, Response, NextFunction } from 'express';
import {
  createFormTemplate,
  getAllFormTemplates,
  getFormTemplateById,
  updateFormTemplate,
  deleteFormTemplate,
  addFieldToForm,
  updateField,
  deleteField
} from '../controllers/formController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// ==============================
// AUTHENTICATION MIDDLEWARE
// ==============================

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      email?: string;
    }
  }
}

// Middleware to verify JWT token and extract user info
const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required'
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId || decoded.id;
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// ==============================
// FORM TEMPLATE ROUTES
// ==============================

/**
 * POST /api/forms
 * Create a new form template
 * Body: { name: string, description?: string, tenantId?: string }
 */
router.post('/', authenticateToken, createFormTemplate);

/**
 * GET /api/forms
 * List all form templates with pagination
 * Query: { page?: number, limit?: number, status?: string, tenantId?: string }
 */
router.get('/', authenticateToken, getAllFormTemplates);

/**
 * GET /api/forms/:id
 * Get a specific form with all its field definitions
 */
router.get('/:id', authenticateToken, getFormTemplateById);

/**
 * PUT /api/forms/:id
 * Update form template details
 * Body: { name?: string, description?: string, status?: string }
 */
router.put('/:id', authenticateToken, updateFormTemplate);

/**
 * DELETE /api/forms/:id
 * Archive (soft delete) a form template
 */
router.delete('/:id', authenticateToken, deleteFormTemplate);

// ==============================
// FIELD DEFINITION ROUTES
// ==============================

/**
 * POST /api/forms/:id/fields
 * Add a new field to a form
 * Body: {
 *   fieldName: string,
 *   fieldType: string,
 *   required?: boolean,
 *   order: number,
 *   validation?: Record<string, any>,
 *   uiProperties?: Record<string, any>,
 *   options?: Record<string, any>
 * }
 */
router.post('/:id/fields', authenticateToken, addFieldToForm);

/**
 * PUT /api/forms/:formId/fields/:fieldId
 * Update a field definition
 * Body: {
 *   fieldName?: string,
 *   fieldType?: string,
 *   required?: boolean,
 *   order?: number,
 *   validation?: Record<string, any>,
 *   uiProperties?: Record<string, any>,
 *   options?: Record<string, any>
 * }
 */
router.put('/:formId/fields/:fieldId', authenticateToken, updateField);

/**
 * DELETE /api/forms/:formId/fields/:fieldId
 * Delete a field from a form
 */
router.delete('/:formId/fields/:fieldId', authenticateToken, deleteField);

// ==============================
// ERROR HANDLING
// ==============================

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Form API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

export default router;
