// Auth Routes - API endpoints for authentication
import { Router } from 'express';
import { login, verifyToken, logout } from '../controllers/authController.js';

const router = Router();

// ==============================
// Auth Routes
// ==============================

// POST login
router.post('/login', login);

// POST verify token
router.post('/verify', verifyToken);

// POST logout
router.post('/logout', logout);

export default router;
