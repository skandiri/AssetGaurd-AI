import api from './api';

// ==============================
// Type Definitions
// ==============================

export interface WaveformConfig {
  sampleRate_Hz: number;
  accelRange_g: number;
}

export interface WaveformData {
  horiz: number[];
  vert: number[];
  axial: number[];
}

export interface WaveformMetadata {
  sampleCount: number;
  duration_s: number;
  nyquist_Hz: number;
  frequencyResolution_Hz: number;
}

export interface WaveformResponse {
  sensorId: string;
  timestamp: number;
  sensorType: string;
  config: WaveformConfig;
  data: WaveformData;
  metadata: WaveformMetadata;
}

export interface WaveformComparisonResponse {
  sensorId: string;
  baseline: WaveformResponse;
  current: WaveformResponse;
}

// ==============================
// Service Functions
// ==============================

/**
 * Fetch waveform data for a specific sensor at a given timestamp
 * @param sensorId - Unique sensor identifier
 * @param timestamp - Unix epoch timestamp (e.g., 1761254160)
 * @returns Parsed waveform data with g-force values and metadata
 */
export const fetchWaveform = async (
  sensorId: string,
  timestamp: number
): Promise<WaveformResponse> => {
  try {
    const response = await api.get(`/spectral/waveform/${sensorId}/${timestamp}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching waveform:', error);
    throw new Error(
      error.response?.data?.error?.message || 'Failed to fetch waveform data'
    );
  }
};

/**
 * Fetch and compare two waveforms from the same sensor at different timestamps
 * @param sensorId - Unique sensor identifier
 * @param t1 - First timestamp (Unix epoch)
 * @param t2 - Second timestamp (Unix epoch)
 * @returns Comparison object with baseline and current waveforms
 */
export const fetchWaveformComparison = async (
  sensorId: string,
  t1: number,
  t2: number
): Promise<WaveformComparisonResponse> => {
  try {
    const response = await api.get(`/spectral/waveform/${sensorId}/compare`, {
      params: { t1, t2 }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching waveform comparison:', error);
    throw new Error(
      error.response?.data?.error?.message || 'Failed to compare waveforms'
    );
  }
};

/**
 * Waveform service object (alternative object-based export pattern)
 */
export const waveformService = {
  fetchWaveform,
  fetchWaveformComparison,
};

export default waveformService;
