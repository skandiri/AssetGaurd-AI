import React, { useMemo, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';
import './charts.css';

interface TimeWaveformChartProps {
  data: number[];
  sampleRate_Hz: number;
  axisLabel: string;
}

const TimeWaveformChart: React.FC<TimeWaveformChartProps> = ({ data, sampleRate_Hz }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  const timeAxis = useMemo(() => data.map((_, i) => i / sampleRate_Hz), [data, sampleRate_Hz]);
  const maxDuration = useMemo(() => (data.length ? data.length / sampleRate_Hz : 0), [data, sampleRate_Hz]);



  // Dynamically compute y-limit to avoid spike truncation
  const defaultLimit = 0.5;
  const maxAbs = useMemo(() => (data.length ? Math.max(...data.map(v => Math.abs(v))) : 0), [data]);
  const finalLimit = useMemo(() => Math.max(defaultLimit, maxAbs * 1.1), [defaultLimit, maxAbs]);

  // Compute y-ticks for the current range
  function getNiceTicks(min: number, max: number, count = 5) {
    if (min === max) {
      const delta = Math.abs(min) > 0.1 ? Math.abs(min) * 0.1 : 0.1;
      return [parseFloat((min - delta).toFixed(2)), parseFloat(min.toFixed(2)), parseFloat((min + delta).toFixed(2))];
    }
    const step = (max - min) / (count - 1);
    const decimals = step < 0.1 ? 2 : 1;
    return Array.from({ length: count }, (_, i) => parseFloat((min + i * step).toFixed(decimals)));
  }
  const yTicks = useMemo(() => getNiceTicks(-finalLimit, finalLimit), [finalLimit]);


  // Reset zoom: restore x/y axis range and ticks with recalculated y-limit
  const handleResetZoom = () => {
    if (!plotRef.current) return;
    const maxAbsNow = data.length ? Math.max(...data.map(v => Math.abs(v))) : 0;
    const finalLimitNow = Math.max(defaultLimit, maxAbsNow * 1.1);
    const yTicksNow = getNiceTicks(-finalLimitNow, finalLimitNow);
    Plotly.relayout(plotRef.current, {
      'xaxis.range': [0, maxDuration],
      'xaxis.autorange': false,
      'yaxis.range': [-finalLimitNow, finalLimitNow],
      'yaxis.autorange': false,
      'yaxis.tickmode': 'array',
      'yaxis.tickvals': yTicksNow,
    });
  };

  useEffect(() => {
    if (!plotRef.current || !data.length) return;

    const plotData = [
      {
        x: timeAxis,
        y: data,
        type: 'scattergl',
        mode: 'lines',
        line: { color: '#2E75B6', width: 1 },
      },
    ];

    const layout = {
      title: null,
      xaxis: {
        title: { text: 'Time (s)', font: { size: 12 } },
        range: [0, maxDuration],
        autorange: false,
        showgrid: true,
        zeroline: true,
        showspikes: true,
        showline: true,
        mirror: false,
        linewidth: 2,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#6366F1',
      },
      yaxis: {
        title: { text: 'Acceleration (g)', font: { size: 12 } },
        range: [-finalLimit, finalLimit],
        autorange: false,
        zeroline: true,
        showline: true,
        linewidth: 2,
        mirror: false,
        fixedrange: false,
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#6366F1',
        spikedash: 'solid',
        tickmode: 'array',
        tickvals: yTicks,
      },
      margin: { t: 10, r: 20, b: 50, l: 60 },
      hovermode: 'x',
      spikedistance: -1,
      dragmode: 'zoom',
    };

    const config = { responsive: true, displayModeBar: false, displaylogo: false, scrollZoom: true };

    Plotly.react(plotRef.current, plotData, layout, config);

    // Relayout handler for user interaction (zoom/pan)
    const handleRelayout = (eventData: any) => {
      if (!plotRef.current) return;
      // If user zooms/pans, enable autorange for both axes
      if ((eventData['xaxis.range[0]'] !== undefined && eventData['xaxis.range[1]'] !== undefined) ||
          (eventData['yaxis.range[0]'] !== undefined && eventData['yaxis.range[1]'] !== undefined)) {
        Plotly.relayout(plotRef.current, {
          'xaxis.autorange': true,
          'yaxis.autorange': true
        });
      }
    };

    plotRef.current.addEventListener('plotly_relayout', handleRelayout);

    return () => {
      if (plotRef.current) {
        plotRef.current.removeEventListener('plotly_relayout', handleRelayout);
        Plotly.purge(plotRef.current);
      }
    };
  }, [data, timeAxis, maxDuration, sampleRate_Hz, finalLimit, yTicks]);

  return (
    <div className="time-waveform-wrapper">
      <div className="chart-header">
        <button onClick={handleResetZoom} className="reset-zoom-icon-button" title="Reset zoom">
          <RotateCcw size={18} />
        </button>
      </div>
      <div ref={plotRef} className="time-waveform-container" />
    </div>
  );
};

export { TimeWaveformChart };