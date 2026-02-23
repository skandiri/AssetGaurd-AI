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



  // Compute max absolute value and padded y-limit
  const maxAbs = useMemo(() => (data.length ? Math.max(...data.map(v => Math.abs(v))) : 1), [data]);
  const padding = useMemo(() => maxAbs * 0.15, [maxAbs]);
  const yLimit = useMemo(() => maxAbs + padding, [maxAbs, padding]);

  // Compute nice tick values for y-axis (1 or 2 decimals)
  function getNiceTicks(min: number, max: number, count = 5) {
    if (min === max) {
      const delta = Math.abs(min) > 0.1 ? Math.abs(min) * 0.1 : 0.1;
      return [parseFloat((min - delta).toFixed(2)), parseFloat(min.toFixed(2)), parseFloat((min + delta).toFixed(2))];
    }
    const step = (max - min) / (count - 1);
    const decimals = step < 0.1 ? 2 : 1;
    return Array.from({ length: count }, (_, i) => parseFloat((min + i * step).toFixed(decimals)));
  }

  // Always use dynamic y-axis ticks and range
  const yTicks = useMemo(() => getNiceTicks(-yLimit, yLimit), [yLimit]);


  // Reset zoom: restore dynamic y-axis range and ticks
  const handleResetZoom = () => {
    if (!plotRef.current) return;
    Plotly.relayout(plotRef.current, {
      'xaxis.autorange': true,
      'yaxis.range': [-yLimit, yLimit],
      'yaxis.tickmode': 'array',
      'yaxis.tickvals': yTicks,
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
        autorange: true,
        showgrid: true,
        zeroline: true,
        showspikes: true,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#6366F1',
      },
      yaxis: {
        title: { text: 'Acceleration (g)', font: { size: 12 } },
        range: [-yLimit, yLimit],
        zeroline: true,
        showline: true,
        linewidth: 2,
        mirror: true,
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

      let x0 = eventData['xaxis.range[0]'];
      let x1 = eventData['xaxis.range[1]'];
      if (eventData['xaxis.autorange'] === true) {
        x0 = 0;
        x1 = maxDuration;
      }
      if (x0 === undefined || x1 === undefined) return;

      const xspan = Math.abs(x1 - x0);

      // X-axis dynamic ticks
      let xtickmode, xdtick, xtickformat;
      if (xspan >= 1) {
        xtickmode = 'linear';
        xdtick = Math.max(1, Math.floor(xspan / 5));
        xtickformat = 'd';
      } else if (xspan >= 0.1) {
        xtickmode = 'linear';
        xdtick = 0.1;
        xtickformat = '.1f';
      } else if (xspan >= 0.01) {
        xtickmode = 'linear';
        xdtick = 0.01;
        xtickformat = '.2f';
      } else {
        xtickmode = 'linear';
        xdtick = 0.001;
        xtickformat = '.3f';
      }

      // Y-axis dynamic ticks (always use [-yLimit, yLimit])
      let ytickmode = 'array';
      let ytickvals = getNiceTicks(-yLimit, yLimit);

      Plotly.relayout(plotRef.current, {
        'xaxis.tickmode': xtickmode,
        'xaxis.dtick': xdtick,
        'xaxis.tickformat': xtickformat,
        'yaxis.tickmode': ytickmode,
        'yaxis.tickvals': ytickvals,
        'yaxis.range': [-yLimit, yLimit],
      });
    };

    plotRef.current.addEventListener('plotly_relayout', handleRelayout);

    return () => {
      if (plotRef.current) {
        plotRef.current.removeEventListener('plotly_relayout', handleRelayout);
        Plotly.purge(plotRef.current);
      }
    };
  }, [data, timeAxis, maxDuration, sampleRate_Hz, yLimit, yTicks]);

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