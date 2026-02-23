import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// Type Definitions
// ==============================

interface SensorParametersObj {
  [key: string]: number;
}

interface TrendDataPoint {
  timestamp: number;
  sensorParameters: SensorParametersObj;
  hasRawWaveform: boolean;
}

interface TrendFileData {
  sensorId: string;
  trendData: TrendDataPoint[];
  rawWaveformTimestamps: number[];
}

interface TrendResponsePoint {
  timestamp: number;
  value: number;
  hasRawWaveform: boolean;
}

interface TrendResponse {
  sensorId: string;
  metric: string;
  range: string;
  dataPoints: TrendResponsePoint[];
  rawWaveformTimestamps: number[];
}

// ==============================
// Helper Functions
// ==============================

function getTimeThresholdSeconds(range: string): number | null {
  const now = Math.floor(Date.now() / 1000);
  
  switch (range.toLowerCase()) {
    case '7d':
      return now - (7 * 24 * 60 * 60);
    case '1m':
      return now - (30 * 24 * 60 * 60);
    case '1y':
      return null; // No threshold, return all data
    default:
      return null;
  }
}

// ==============================
// Controller Functions
// ==============================

/**
 * Get list of available sensors with trend data
 */
export const getSensors = async (req: Request, res: Response): Promise<void> => {
  try {
    const unifiedDir = path.join(__dirname, '../../data/unified');
    
    // Read all files in the unified directory
    const files = await fs.readdir(unifiedDir);
    
    // Filter for trend JSON files and extract sensor info
    const sensors: { id: string; name: string; type?: string }[] = [];
    
    for (const file of files) {
      if (file.endsWith('_trend.json')) {
        const sensorId = file.replace('_trend.json', '');
        try {
          const filePath = path.join(unifiedDir, file);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(fileContent);
          sensors.push({
            id: sensorId,
            name: data.sensorName || `Sensor ${sensorId}`,
            type: data.sensorType || 'Unknown',
          });
        } catch {
          // If file can't be read, still include sensor with basic info
          sensors.push({
            id: sensorId,
            name: `Sensor ${sensorId}`,
            type: 'Unknown',
          });
        }
      }
    }
    
    res.status(200).json({ sensors });
  } catch (error) {
    console.error('Error in getSensors:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { metric, range } = req.query;

    // Validate required parameters
    if (!sensorId) {
      res.status(400).json({ error: 'sensorId is required' });
      return;
    }

    if (!metric || typeof metric !== 'string') {
      res.status(400).json({ error: 'metric query parameter is required and must be a string' });
      return;
    }

    if (!range || typeof range !== 'string') {
      res.status(400).json({ error: 'range query parameter is required and must be a string' });
      return;
    }

    // Validate range format
    const validRanges = ['7d', '1m', '1y'];
    if (!validRanges.includes(range.toLowerCase())) {
      res.status(400).json({ error: 'range must be one of: 7d, 1m, 1y' });
      return;
    }

    // Try to read individual sensor file first, then fall back to combined trend_data.json
    let trendFileData: any = null;

    const individualFilePath = path.join(
      __dirname,
      '../../data/unified',
      `${sensorId}_trend.json`
    );

    const combinedFilePath = path.join(
      __dirname,
      '../../data/unified',
      'trend_data.json'
    );

    // Try individual file first
    try {
      const fileContent = await fs.readFile(individualFilePath, 'utf-8');
      trendFileData = JSON.parse(fileContent);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Try combined file
        try {
          const fileContent = await fs.readFile(combinedFilePath, 'utf-8');
          const allData = JSON.parse(fileContent);
          
          // Check if the sensorId matches the data in the file
          if (allData.sensorId === sensorId) {
            trendFileData = allData;
          }
        } catch (combinedError) {
          // No data found - will return empty response
        }
      } else {
        throw error;
      }
    }

    // If no trend data found, return empty response
    if (!trendFileData) {
      const response: TrendResponse = {
        sensorId,
        metric,
        range,
        dataPoints: [],
        rawWaveformTimestamps: [],
      };
      res.status(200).json(response);
      return;
    }

    // Get time threshold for filtering
    const timeThreshold = getTimeThresholdSeconds(range);

    // Get list of available waveform files for this sensor
    const waveformDir = path.join(__dirname, '../../data/waveforms');
    let availableWaveformTimestamps: Set<number> = new Set();
    
    try {
      const waveformFiles = await fs.readdir(waveformDir);
      // Look for files matching pattern: {sensorId}_{timestamp}.json or raw_waveform_{sensorId}_{timestamp}.json
      const sensorWaveformPattern = new RegExp(`^(raw_waveform_)?${sensorId}_(\\d+)\\.json$`);
      
      for (const file of waveformFiles) {
        const match = file.match(sensorWaveformPattern);
        if (match) {
          availableWaveformTimestamps.add(parseInt(match[2], 10));
        }
      }
    } catch (error) {
      // Waveform directory might not exist, continue without waveform availability
      console.warn('Could not read waveforms directory:', error);
    }

    // Filter and extract data
    const dataPoints: TrendResponsePoint[] = trendFileData.trendData
      .filter((point: TrendDataPoint) => {
        // Apply time-based filter if threshold exists
        if (timeThreshold !== null) {
          return point.timestamp >= timeThreshold;
        }
        return true; // Include all for '1y'
      })
      .map((point: TrendDataPoint) => {
        const value = point.sensorParameters[metric];

        // Check if metric exists in this data point
        if (value === undefined || value === null) {
          return null;
        }

        // Check if waveform file actually exists for this sensor/timestamp
        const hasWaveformFile = availableWaveformTimestamps.has(point.timestamp);

        return {
          timestamp: point.timestamp,
          value: typeof value === 'number' ? value : parseFloat(String(value)),
          hasRawWaveform: hasWaveformFile,
        };
      })
      .filter((point: TrendResponsePoint | null): point is TrendResponsePoint => point !== null);

    // Build response (empty dataPoints is valid - frontend will show "no data" message)
    const response: TrendResponse = {
      sensorId,
      metric,
      range,
      dataPoints,
      rawWaveformTimestamps: trendFileData.rawWaveformTimestamps || [],
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getTrend:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
