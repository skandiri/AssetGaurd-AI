import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get sensor registry from sensors.json
 */
export const getSensors = async (req: Request, res: Response): Promise<void> => {
  try {
    const sensorsPath = path.join(__dirname, '../../data/sensors.json');
    
    const fileContents = await fs.readFile(sensorsPath, 'utf-8');
    const sensorsData = JSON.parse(fileContents);
    
    res.json(sensorsData);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ 
        error: 'Sensor registry not found',
        message: 'sensors.json file does not exist'
      });
      return;
    }
    
    console.error('Error reading sensors:', error);
    res.status(500).json({ 
      error: 'Failed to read sensor registry',
      message: error.message 
    });
  }
};
