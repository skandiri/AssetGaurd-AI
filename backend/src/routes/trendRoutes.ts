import { Router } from 'express';
import { getTrend, getSensors } from '../controllers/trendController';

const router = Router();

/**
 * GET /api/spectral/sensors
 * 
 * Get list of available sensors with trend data
 * 
 * Response: { sensors: [{ id, name, type }] }
 */
router.get('/sensors', getSensors);

/**
 * GET /api/spectral/trend/:sensorId
 * 
 * Get trend data for a specific sensor and metric
 * 
 * Query Parameters:
 * - metric: string (e.g. "crestFactorAxial_g", "rmsAxial_g")
 * - range: string ("7d" | "1m" | "1y")
 * 
 * Response: TrendResponse with filtered dataPoints
 */
router.get('/trend/:sensorId', getTrend);

export default router;
