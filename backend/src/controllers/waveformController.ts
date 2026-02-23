import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

// ==============================
// Type Definitions
// ==============================

interface WaveformConfig {
  sampleRate_Hz: number;
  accelRange_g: number;
}

interface SensorParameters {
  rawHoriz: string;
  rawVert: string;
  rawAxial: string;
}

interface WaveformPayload {
  sensorId: string;
  timestamp: number;
  sensorType: string;
  config: WaveformConfig;
  sensorParameters: SensorParameters;
}

interface WaveformData {
  horiz: number[];
  vert: number[];
  axial: number[];
}

interface WaveformMetadata {
  sampleCount: number;
  duration_s: number;
  nyquist_Hz: number;
  frequencyResolution_Hz: number;
}

interface WaveformResponse {
  sensorId: string;
  timestamp: number;
  sensorType: string;
  config: WaveformConfig;
  data: WaveformData;
  metadata: WaveformMetadata;
}

// ==============================
// Helper Functions
// ==============================

/**
 * Decode base64 string to Buffer and unpack as 16-bit signed little-endian integers
 */
function decodeAndUnpackBase64(base64String: string): number[] {
  const buffer = Buffer.from(base64String, 'base64');
  const values: number[] = [];
  
  // Read 16-bit signed little-endian integers
  for (let i = 0; i < buffer.length; i += 2) {
    if (i + 1 < buffer.length) {
      values.push(buffer.readInt16LE(i));
    }
  }
  
  return values;
}

/**
 * Scale raw integer values to g values
 */
function scaleToG(rawValues: number[], accelRange_g: number): number[] {
  return rawValues.map(rawInt => rawInt * (accelRange_g / 32768));
}

// ==============================
// Controller Functions
// ==============================

/**
 * GET /api/spectral/waveform/:sensorId/:timestamp
 * Retrieve and process waveform data from sensor readings
 */
export const getWaveform = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, timestamp } = req.params;

    if (!sensorId || !timestamp) {
      res.status(400).json({
        error: {
          message: 'Missing required parameters: sensorId and timestamp',
        },
      });
      return;
    }

    // Construct file path - try both naming patterns
    const dataDir = path.join(process.cwd(), 'data', 'waveforms');
    const filePath1 = path.join(dataDir, `${sensorId}_${timestamp}.json`);
    const filePath2 = path.join(dataDir, `raw_waveform_${sensorId}_${timestamp}.json`);

    // Read and parse JSON file - try both patterns
    let fileContent: string;
    try {
      try {
        fileContent = await fs.readFile(filePath1, 'utf-8');
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Try alternate naming pattern
          fileContent = await fs.readFile(filePath2, 'utf-8');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: {
            message: `Waveform data not found for sensor ${sensorId} at timestamp ${timestamp}`,
          },
        });
        return;
      }
      throw error;
    }

    // Parse JSON payload
    let payload: WaveformPayload;
    try {
      payload = JSON.parse(fileContent);
    } catch (error) {
      res.status(400).json({
        error: {
          message: 'Invalid JSON format in waveform data file',
        },
      });
      return;
    }

    // Validate required fields
    if (!payload.config?.sampleRate_Hz || !payload.config?.accelRange_g) {
      res.status(400).json({
        error: {
          message: 'Missing required config fields: sampleRate_Hz and accelRange_g',
        },
      });
      return;
    }

    if (!payload.sensorParameters?.rawHoriz || !payload.sensorParameters?.rawVert || !payload.sensorParameters?.rawAxial) {
      res.status(400).json({
        error: {
          message: 'Missing required sensor parameters: rawHoriz, rawVert, rawAxial',
        },
      });
      return;
    }

    // Extract config values
    const { sampleRate_Hz, accelRange_g } = payload.config;

    // Decode and unpack raw data
    let rawHorizValues: number[];
    let rawVertValues: number[];
    let rawAxialValues: number[];

    try {
      rawHorizValues = decodeAndUnpackBase64(payload.sensorParameters.rawHoriz);
      rawVertValues = decodeAndUnpackBase64(payload.sensorParameters.rawVert);
      rawAxialValues = decodeAndUnpackBase64(payload.sensorParameters.rawAxial);
    } catch (error) {
      res.status(400).json({
        error: {
          message: 'Failed to decode base64 sensor data',
        },
      });
      return;
    }

    // Scale to g values
    const horizG = scaleToG(rawHorizValues, accelRange_g);
    const vertG = scaleToG(rawVertValues, accelRange_g);
    const axialG = scaleToG(rawAxialValues, accelRange_g);

    // DC offset removal (industry standard - centers waveform on zero)
    const removeDC = (values: number[]): number[] => {
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      return values.map(v => v - mean);
    };

    const horizFinal = removeDC(horizG);
    const vertFinal = removeDC(vertG);
    const axialFinal = removeDC(axialG);

    // Calculate metadata (no trimming)
    const sampleCount = horizFinal.length;
    const duration_s = sampleCount / sampleRate_Hz;
    const nyquist_Hz = sampleRate_Hz / 2;
    const frequencyResolution_Hz = sampleRate_Hz / sampleCount;

    // Build response
    const response: WaveformResponse = {
      sensorId: payload.sensorId,
      timestamp: payload.timestamp,
      sensorType: payload.sensorType,
      config: {
        sampleRate_Hz,
        accelRange_g,
      },
      data: {
        horiz: horizFinal,
        vert: vertFinal,
        axial: axialFinal,
      },
      metadata: {
        sampleCount,
        duration_s,
        nyquist_Hz,
        frequencyResolution_Hz,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error processing waveform data:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error while processing waveform data',
      },
    });
  }
};

/**
 * GET /api/spectral/waveform/:sensorId/compare?t1=timestamp1&t2=timestamp2
 * Compare two waveforms from the same sensor at different timestamps
 */
export const compareWaveforms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { t1, t2 } = req.query;

    if (!sensorId || !t1 || !t2) {
      res.status(400).json({
        error: {
          message: 'Missing required parameters: sensorId and query params t1, t2',
        },
      });
      return;
    }

    // Process both waveforms
    const processWaveform = async (timestamp: string): Promise<WaveformResponse> => {
      const dataDir = path.join(process.cwd(), 'data', 'waveforms');
      const filePath = path.join(dataDir, `${sensorId}_${timestamp}.json`);

      const fileContent = await fs.readFile(filePath, 'utf-8');
      const payload: WaveformPayload = JSON.parse(fileContent);

      if (!payload.config?.sampleRate_Hz || !payload.config?.accelRange_g) {
        throw new Error('Missing required config fields');
      }

      if (!payload.sensorParameters?.rawHoriz || !payload.sensorParameters?.rawVert || !payload.sensorParameters?.rawAxial) {
        throw new Error('Missing required sensor parameters');
      }

      const { sampleRate_Hz, accelRange_g } = payload.config;

      const rawHorizValues = decodeAndUnpackBase64(payload.sensorParameters.rawHoriz);
      const rawVertValues = decodeAndUnpackBase64(payload.sensorParameters.rawVert);
      const rawAxialValues = decodeAndUnpackBase64(payload.sensorParameters.rawAxial);

      const horizG = scaleToG(rawHorizValues, accelRange_g);
      const vertG = scaleToG(rawVertValues, accelRange_g);
      const axialG = scaleToG(rawAxialValues, accelRange_g);

      const sampleCount = horizG.length;
      const duration_s = sampleCount / sampleRate_Hz;
      const nyquist_Hz = sampleRate_Hz / 2;
      const frequencyResolution_Hz = sampleRate_Hz / sampleCount;

      return {
        sensorId: payload.sensorId,
        timestamp: payload.timestamp,
        sensorType: payload.sensorType,
        config: { sampleRate_Hz, accelRange_g },
        data: { horiz: horizG, vert: vertG, axial: axialG },
        metadata: { sampleCount, duration_s, nyquist_Hz, frequencyResolution_Hz },
      };
    };

    try {
      const [waveform1, waveform2] = await Promise.all([
        processWaveform(t1 as string),
        processWaveform(t2 as string),
      ]);

      res.status(200).json({
        sensorId,
        baseline: waveform1,
        current: waveform2,
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: {
            message: `One or both waveform files not found for sensor ${sensorId}`,
          },
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error comparing waveforms:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error while comparing waveforms',
      },
    });
  }
};
