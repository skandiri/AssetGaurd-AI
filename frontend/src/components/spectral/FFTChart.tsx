import React, { useMemo, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';
import { computeFFT } from '../../utils/fftUtils';
import './charts.css';

interface FFTChartProps {
  data: number[];           // acceleration values in g
  sampleRate_Hz: number;    // from config.sampleRate_Hz
  axisLabel: string;        // "Horizontal" | "Vertical" | "Axial"
}

const FFTChart: React.FC<FFTChartProps> = ({ data, sampleRate_Hz, axisLabel }) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  const fftResult = useMemo(() => {
    if (!data || data.length === 0) return null;
    return computeFFT(data, sampleRate_Hz);
  }, [data, sampleRate_Hz]);

  const handleResetZoom = () => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'xaxis.autorange': true,
        'yaxis.autorange': true,
      });
    }
  };

  useEffect(() => {
    if (!plotRef.current || !fftResult) return;

    const plotData = [
      {
        x: fftResult.frequencies,
        y: fftResult.magnitudes,
        type: 'scattergl',
        mode: 'lines',
        line: { color: '#2E75B6', width: 1 },
        marker: { size: 4, color: '#2E75B6' },
        hovertemplate:
          'Frequency: %{x:.2f} Hz<br>' +
          'Amplitude: %{y:.5f} g rms<br>' +
          'CPM: %{customdata:.1f}<extra></extra>',
        customdata: fftResult.frequencies.map(f => f * 60),
        hoverlabel: {
          bgcolor: '#1a1a2e',
          bordercolor: '#1a1a2e',
          font: { color: 'white', size: 12 },
        },
      },
    ];

    const layout = {
      title: { text: '' },
      xaxis: {
        title: { text: 'Frequency (Hz)', font: { size: 12 } },
        rangeslider: { visible: false },
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#6366F1',
        spikedash: 'dot',
        showline: true,
        linecolor: '#E2E6EE',
        range: [0, 2500], // Restrict x-axis to 0-2500 Hz
      },
      yaxis: {
        title: { text: 'Amplitude (g rms)', font: { size: 12 } },
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#6366F1',
        spikedash: 'dot',
        showline: true,
        linecolor: '#E2E6EE',
      },
      margin: { t: 10, r: 20, b: 40, l: 60 },
      hovermode: 'x',
      spikedistance: -1,
      dragmode: 'zoom',
    };

    const config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      scrollZoom: true,
    };

    Plotly.react(plotRef.current, plotData, layout, config);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [fftResult, axisLabel]);

  if (!fftResult) return null;

  return (
    <div className="fft-chart-wrapper">
      <div className="chart-header">
        <button 
          ref={resetButtonRef} 
          onClick={handleResetZoom}
          className="reset-zoom-icon-button"
          title="Reset zoom and pan"
          aria-label="Reset zoom"
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <div ref={plotRef} className="fft-chart-container" />
    </div>
  );
};

export { FFTChart };
