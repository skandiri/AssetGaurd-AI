// Waveform Routes - API endpoints for sensor waveform data
import { Router } from 'express';
import { getWaveform, compareWaveforms } from '../controllers/waveformController.js';

const router = Router();

// GET compare two waveforms by sensorId and timestamps (t1, t2 as query params)
// ⚠️ IMPORTANT: This must be BEFORE the /:timestamp route (Express matches top-down)
router.get('/waveform/:sensorId/compare', compareWaveforms);

// GET waveform data by sensorId and timestamp
router.get('/waveform/:sensorId/:timestamp', getWaveform);

export default router;
