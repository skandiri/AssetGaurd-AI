import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchWaveform, type WaveformResponse } from '../services/waveformService';
import { AxisSelector, TimeWaveformChart, FFTChart, type Axis } from '../components/spectral';
import { Activity, AlertCircle } from 'lucide-react';

export const SpectralAnalysisPage: React.FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const [searchParams] = useSearchParams();
  const timestamp = searchParams.get('timestamp');

  const [waveformData, setWaveformData] = useState<WaveformResponse | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<Axis>('horiz');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWaveform = async () => {
      if (!sensorId || !timestamp) {
        setError('Missing sensor ID or timestamp');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWaveform(sensorId, parseInt(timestamp));
        setWaveformData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load waveform data');
        console.error('Error loading waveform:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWaveform();
  }, [sensorId, timestamp]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-lg font-medium text-slate-700">Loading waveform data...</p>
          <p className="mt-2 text-sm text-slate-500">
            Decoding sensor data and preparing visualization
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h2 className="mb-2 text-xl font-semibold text-red-900">Error Loading Data</h2>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!waveformData) {
    return null;
  }

  const currentAxisData = waveformData.data[selectedAxis];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Spectral Analysis</h1>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Sensor ID:</span> {waveformData.sensorId}
              </p>
              <p>
                <span className="font-medium">Timestamp:</span>{' '}
                {new Date(waveformData.timestamp * 1000).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Sensor Type:</span> {waveformData.sensorType}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Configuration
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Sample Rate:</span>{' '}
                {waveformData.config.sampleRate_Hz.toFixed(2)} Hz
              </p>
              <p>
                <span className="font-medium">Accel Range:</span> ±{waveformData.config.accelRange_g}g
              </p>
              <p>
                <span className="font-medium">Duration:</span>{' '}
                {waveformData.metadata.duration_s.toFixed(3)}s
              </p>
              <p>
                <span className="font-medium">Samples:</span>{' '}
                {waveformData.metadata.sampleCount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Nyquist:</span>{' '}
                {waveformData.metadata.nyquist_Hz.toFixed(2)} Hz
              </p>
              <p>
                <span className="font-medium">Freq Resolution:</span>{' '}
                {waveformData.metadata.frequencyResolution_Hz.toFixed(4)} Hz
              </p>
            </div>
          </div>
        </div>

        {/* Axis Selector */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">Select Axis:</span>
          <AxisSelector selectedAxis={selectedAxis} onAxisChange={setSelectedAxis} />
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <TimeWaveformChart
          data={currentAxisData}
          sampleRate_Hz={waveformData.config.sampleRate_Hz}
          axisLabel="Horizontal"
        />

        <FFTChart
          data={currentAxisData}
          sampleRate_Hz={waveformData.config.sampleRate_Hz}
          axisLabel="Horizontal"
        />
      </div>
    </div>
  );
};
