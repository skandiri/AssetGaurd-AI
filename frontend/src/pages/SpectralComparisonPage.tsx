import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchWaveformComparison, type WaveformComparisonResponse } from '../services/waveformService';
import { AxisSelector, FFTChart, type Axis } from '../components/spectral';
import { Activity, AlertCircle, ArrowLeftRight } from 'lucide-react';

export const SpectralComparisonPage: React.FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const [searchParams] = useSearchParams();
  const t1 = searchParams.get('t1');
  const t2 = searchParams.get('t2');

  const [comparisonData, setComparisonData] = useState<WaveformComparisonResponse | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<Axis>('horiz');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComparison = async () => {
      if (!sensorId || !t1 || !t2) {
        setError('Missing sensor ID or timestamps');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWaveformComparison(sensorId, parseInt(t1), parseInt(t2));
        setComparisonData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load comparison data');
        console.error('Error loading comparison:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComparison();
  }, [sensorId, t1, t2]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-lg font-medium text-slate-700">Loading comparison data...</p>
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

  if (!comparisonData) {
    return null;
  }

  const baselineAxisData = comparisonData.baseline.data[selectedAxis];
  const currentAxisData = comparisonData.current.data[selectedAxis];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <ArrowLeftRight className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-900">Spectral Comparison</h1>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Baseline */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Baseline
            </h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Sensor ID:</span> {comparisonData.baseline.sensorId}
              </p>
              <p>
                <span className="font-medium">Timestamp:</span>{' '}
                {new Date(comparisonData.baseline.timestamp * 1000).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Sample Rate:</span>{' '}
                {comparisonData.baseline.config.sampleRate_Hz.toFixed(2)} Hz
              </p>
              <p>
                <span className="font-medium">Duration:</span>{' '}
                {comparisonData.baseline.metadata.duration_s.toFixed(3)}s
              </p>
            </div>
          </div>

          {/* Current */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-700">
              Current
            </h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Sensor ID:</span> {comparisonData.current.sensorId}
              </p>
              <p>
                <span className="font-medium">Timestamp:</span>{' '}
                {new Date(comparisonData.current.timestamp * 1000).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Sample Rate:</span>{' '}
                {comparisonData.current.config.sampleRate_Hz.toFixed(2)} Hz
              </p>
              <p>
                <span className="font-medium">Duration:</span>{' '}
                {comparisonData.current.metadata.duration_s.toFixed(3)}s
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

      {/* Side-by-Side FFT Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="mb-2 rounded-t-lg bg-slate-100 px-4 py-2">
            <span className="text-sm font-medium text-slate-700">Baseline Spectrum</span>
          </div>
          <FFTChart
            data={baselineAxisData}
            sampleRate_Hz={comparisonData.baseline.config.sampleRate_Hz}
            axisLabel="Horizontal"
          />
        </div>

        <div>
          <div className="mb-2 rounded-t-lg bg-indigo-100 px-4 py-2">
            <span className="text-sm font-medium text-indigo-700">Current Spectrum</span>
          </div>
          <FFTChart
            data={currentAxisData}
            sampleRate_Hz={comparisonData.current.config.sampleRate_Hz}
            axisLabel="Horizontal"
          />
        </div>
      </div>
    </div>
  );
};
