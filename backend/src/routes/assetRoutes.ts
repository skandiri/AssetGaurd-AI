// Asset Routes - API endpoints for assets
import { Router, Request, Response, NextFunction } from 'express';
import { createAsset, getAssetById, getAssets } from '../controllers/assetController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      email?: string;
    }
  }
}

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

/**
 * POST /api/assets
 * Create a new asset record
 */
router.post('/', authenticateToken, createAsset);

/**
 * GET /api/assets
 * List assets with optional filters
 */
router.get('/', authenticateToken, getAssets);

/**
 * GET /api/assets/:id
 * Get asset by id with field values
 */
router.get('/:id', authenticateToken, getAssetById);

export default router;
