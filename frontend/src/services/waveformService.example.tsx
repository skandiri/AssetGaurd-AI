// Example usage of waveformService in a React component

import { useState } from 'react';
import { fetchWaveform, fetchWaveformComparison } from '../services/waveformService';
import type { WaveformResponse } from '../services/waveformService';

export const WaveformExample = () => {
  const [waveform, setWaveform] = useState<WaveformResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Fetch single waveform
  const loadWaveform = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWaveform('SENSOR_001', 1761254160);
      setWaveform(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Compare two waveforms
  const compareWaveforms = async () => {
    setLoading(true);
    setError(null);
    try {
      const comparison = await fetchWaveformComparison(
        'SENSOR_001',
        1761254160,
        1761257760
      );
      console.log('Baseline:', comparison.baseline);
      console.log('Current:', comparison.current);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Waveform Viewer</h2>
      <button onClick={loadWaveform} disabled={loading}>
        Load Waveform
      </button>
      <button onClick={compareWaveforms} disabled={loading}>
        Compare Waveforms
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="waveform-error">Error: {error}</p>}

      {waveform && (
        <div>
          <h3>Waveform Data</h3>
          <p>Sensor: {waveform.sensorId}</p>
          <p>Timestamp: {waveform.timestamp}</p>
          <p>Type: {waveform.sensorType}</p>
          <p>Sample Rate: {waveform.config.sampleRate_Hz} Hz</p>
          <p>Accel Range: ±{waveform.config.accelRange_g}g</p>
          <p>Sample Count: {waveform.metadata.sampleCount}</p>
          <p>Duration: {waveform.metadata.duration_s.toFixed(3)}s</p>
          <p>Nyquist Frequency: {waveform.metadata.nyquist_Hz} Hz</p>
          <p>Frequency Resolution: {waveform.metadata.frequencyResolution_Hz.toFixed(4)} Hz</p>
          
          <h4>Data Points</h4>
          <p>Horizontal: {waveform.data.horiz.length} samples</p>
          <p>Vertical: {waveform.data.vert.length} samples</p>
          <p>Axial: {waveform.data.axial.length} samples</p>
        </div>
      )}
    </div>
  );
};
