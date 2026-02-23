import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, TrendingUp } from 'lucide-react';
// @ts-ignore
import Plotly from 'plotly.js-dist-min';
import { TimeWaveformChart, FFTChart } from '../components/spectral';
import { fetchWaveform, type WaveformResponse } from '../services/waveformService';
import './VibrationDiagnosticSuite.css';

type DiagnosticMetric = 
  | 'rmsAxial_g' | 'rmsHoriz_g' | 'rmsVert_g'
  | 'peakAxial_g' | 'peakHoriz_g' | 'peakVert_g'
  | 'peakToPeakAxial_g' | 'peakToPeakHoriz_g' | 'peakToPeakVert_g'
  | 'crestFactorAxial_g' | 'crestFactorHoriz_g' | 'crestFactorVert_g'
  | 'rmsAxial_inps' | 'rmsHoriz_inps' | 'rmsVert_inps'
  | 'peakToPeakAxial_inps' | 'peakToPeakHoriz_inps' | 'peakToPeakVert_inps'
  | 'temperature_C' | 'batteryVoltage_V' | 'sensorSignalStrength_dBm';
type TimeRange = '7d' | '1m' | '1y';

interface TrendDataPoint {
  timestamp: number;
  value: number;
  hasRawWaveform: boolean;
}

interface SensorInfo {
  sensorId: string;
  displayName: string;
  sensorType: string;
  location: string;
}

export const VibrationDiagnosticSuite: React.FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();

  // Sensor state
  const [availableSensors, setAvailableSensors] = useState<SensorInfo[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>('');
  const [sensorsLoading, setSensorsLoading] = useState(true);

  const [selectedMetric, setSelectedMetric] = useState<DiagnosticMetric>('rmsAxial_g');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isTrendLoading, setIsTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [waveformData, setWaveformData] = useState<WaveformResponse | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<'horiz' | 'vert' | 'axial'>('horiz');
  const [isWaveformLoading, setIsWaveformLoading] = useState(false);
  const [waveformError, setWaveformError] = useState<string | null>(null);
  const [noRawWaveform, setNoRawWaveform] = useState(false);
  const [rangeStartIndex, setRangeStartIndex] = useState<number>(0);
  const [rangeEndIndex, setRangeEndIndex] = useState<number>(0);
  const [clickedSensorId, setClickedSensorId] = useState<string | null>(null);

  // Ref for waveform panel to scroll into view
  const waveformPanelRef = useRef<HTMLDivElement>(null);

  // Scroll to waveform panel when waveformData is set
  useEffect(() => {
    if (waveformData && waveformPanelRef.current) {
      waveformPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [waveformData]);

  // Fetch available sensors on mount
  useEffect(() => {
    const fetchSensors = async () => {
      setSensorsLoading(true);
      try {
        const response = await fetch('http://localhost:5002/api/spectral/sensors');
        if (!response.ok) throw new Error('Failed to fetch sensors');
        const result = await response.json();
        setAvailableSensors(result.sensors);
        // Select first sensor by default, or from URL
        if (result.sensors.length > 0) {
          const defaultId = sensorId || result.sensors[0].sensorId;
          setSelectedSensor(defaultId);
        }
      } catch (error) {
        console.error('Error fetching sensors:', error);
      } finally {
        setSensorsLoading(false);
      }
    };
    fetchSensors();
  }, [sensorId]);

  // Handle sensor change - clear waveform data
  const handleSensorChange = (newSensorId: string) => {
    setSelectedSensor(newSensorId);
    setWaveformData(null);
    setWaveformError(null);
    setNoRawWaveform(false);
    setClickedSensorId(null);
  };

  // Fetch trend data for selected sensor
  useEffect(() => {
    if (!selectedSensor) {
      setTrendData([]);
      setIsTrendLoading(false);
      return;
    }

    const fetchTrendData = async () => {
      setIsTrendLoading(true);
      setTrendError(null);
      
      try {
        const params = new URLSearchParams({
          metric: selectedMetric,
          range: timeRange,
        });
        
        const response = await fetch(
          `http://localhost:5002/api/spectral/trend/${selectedSensor}?${params}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch trend data for sensor ${selectedSensor}`);
        }
        
        const result = await response.json();
        setTrendData(result.dataPoints);
        
        // Reset range to full data
        if (result.dataPoints.length > 0) {
          setRangeStartIndex(0);
          setRangeEndIndex(result.dataPoints.length - 1);
        }
      } catch (error) {
        console.error('Error fetching trend data:', error);
        setTrendError((error as Error).message);
        setTrendData([]);
      } finally {
        setIsTrendLoading(false);
      }
    };
    
    if (!sensorsLoading) {
      fetchTrendData();
    }
  }, [selectedMetric, timeRange, selectedSensor, sensorsLoading]);

  // Handle trend chart click to load waveform data
  const handleTrendClick = async (event: any): Promise<void> => {
    console.log('handleTrendClick called with event:', event);

    const point: any = event.points?.[0];
    if (!point) {
      console.warn('No point found in event');
      return;
    }

    const clickedTimestamp = point.customdata?.timestamp;
    const hasRawWaveform = point.customdata?.hasRawWaveform;

    console.log('Clicked point:', { timestamp: clickedTimestamp, hasRawWaveform, sensorId: selectedSensor });

    if (!clickedTimestamp || !selectedSensor) {
      console.warn('No timestamp or selectedSensor available');
      return;
    }

    setClickedSensorId(selectedSensor);

    // Check if raw waveform is available
    if (!hasRawWaveform) {
      console.log('Raw waveform not available for this timestamp');
      setNoRawWaveform(true);
      setWaveformData(null);
      setWaveformError(null);
      return;
    }

    setIsWaveformLoading(true);
    setWaveformError(null);
    setNoRawWaveform(false);
    setSelectedAxis('horiz');

    try {
      console.log('Fetching waveform for sensor:', selectedSensor, 'timestamp:', clickedTimestamp);
      const data = await fetchWaveform(selectedSensor, clickedTimestamp);
      console.log('Waveform data retrieved:', data);
      setWaveformData(data);
    } catch (error: any) {
        // Scroll to waveform panel as soon as waveformData is set and panel is rendered
        useEffect(() => {
          if (waveformData && waveformPanelRef.current) {
            waveformPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, [waveformData]);
      console.error('Error fetching waveform:', error);
      setWaveformError(error.message || 'Failed to load waveform data');
      setWaveformData(null);
    } finally {
      setIsWaveformLoading(false);
    }
  };

  // Handle range start slider change
  const handleRangeStartChange = (index: number): void => {
    // Ensure start doesn't go past end
    const newStart = Math.min(index, rangeEndIndex);
    setRangeStartIndex(newStart);
  };

  // Handle range end slider change
  const handleRangeEndChange = (index: number): void => {
    // Ensure end doesn't go before start
    const newEnd = Math.max(index, rangeStartIndex);
    setRangeEndIndex(newEnd);
  };

  // Get filtered data based on range
  const filteredTrendData = trendData.slice(rangeStartIndex, rangeEndIndex + 1);

  // Get max length for range slider
  const maxDataLength = trendData.length;

  // Format timestamp for display
  const formatTimestamp = (unixSeconds: number): string => {
    const date = new Date(unixSeconds * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const metricLabels: Record<DiagnosticMetric, string> = {
    // Acceleration (g) - Axial
    rmsAxial_g: 'RMS Axial (g)',
    peakAxial_g: 'Peak Axial (g)',
    peakToPeakAxial_g: 'Peak-to-Peak Axial (g)',
    crestFactorAxial_g: 'Crest Factor Axial (g)',
    // Acceleration (g) - Horizontal
    rmsHoriz_g: 'RMS Horizontal (g)',
    peakHoriz_g: 'Peak Horizontal (g)',
    peakToPeakHoriz_g: 'Peak-to-Peak Horizontal (g)',
    crestFactorHoriz_g: 'Crest Factor Horizontal (g)',
    // Acceleration (g) - Vertical
    rmsVert_g: 'RMS Vertical (g)',
    peakVert_g: 'Peak Vertical (g)',
    peakToPeakVert_g: 'Peak-to-Peak Vertical (g)',
    crestFactorVert_g: 'Crest Factor Vertical (g)',
    // Velocity (in/s)
    rmsAxial_inps: 'RMS Axial Velocity (in/s)',
    rmsHoriz_inps: 'RMS Horizontal Velocity (in/s)',
    rmsVert_inps: 'RMS Vertical Velocity (in/s)',
    peakToPeakAxial_inps: 'Peak-to-Peak Axial Velocity (in/s)',
    peakToPeakHoriz_inps: 'Peak-to-Peak Horizontal Velocity (in/s)',
    peakToPeakVert_inps: 'Peak-to-Peak Vertical Velocity (in/s)',
    // Environmental
    temperature_C: 'Temperature (°C)',
    batteryVoltage_V: 'Battery Voltage (V)',
    sensorSignalStrength_dBm: 'Signal Strength (dBm)',
  };

  return (
    <div className="vds-container">
      <div className="vds-header">
        <div className="vds-header-top">
          <div>
            <h1 className="vds-header-title">Vibration Diagnostic Suite</h1>
            <p className="vds-header-subtitle">
              {selectedSensor && availableSensors.find(s => s.sensorId === selectedSensor)?.displayName} ({selectedSensor})
            </p>
            <div className="vds-header-controls">
              <div className="vds-control-group">
                <label htmlFor="sensor-select" className="vds-select-label">Sensor</label>
                <select
                  id="sensor-select"
                  value={selectedSensor}
                  onChange={(e) => handleSensorChange(e.target.value)}
                  className="vds-select-header"
                  disabled={sensorsLoading}
                >
                  {sensorsLoading ? (
                    <option value="">Loading sensors...</option>
                  ) : (
                    availableSensors.map((sensor) => (
                      <option key={sensor.sensorId} value={sensor.sensorId}>
                        {sensor.displayName} ({sensor.sensorId})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="vds-control-group">
                <label htmlFor="diagnostic-metric-select" className="vds-select-label">Diagnostic Parameter</label>
                <select id="diagnostic-metric-select" value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as DiagnosticMetric)} className="vds-select-header">
                  <optgroup label="Acceleration (g) - Axial">
                    <option value="rmsAxial_g">RMS Axial</option>
                    <option value="peakAxial_g">Peak Axial</option>
                    <option value="peakToPeakAxial_g">Peak-to-Peak Axial</option>
                    <option value="crestFactorAxial_g">Crest Factor Axial</option>
                  </optgroup>
                  <optgroup label="Acceleration (g) - Horizontal">
                    <option value="rmsHoriz_g">RMS Horizontal</option>
                    <option value="peakHoriz_g">Peak Horizontal</option>
                    <option value="peakToPeakHoriz_g">Peak-to-Peak Horizontal</option>
                    <option value="crestFactorHoriz_g">Crest Factor Horizontal</option>
                  </optgroup>
                  <optgroup label="Acceleration (g) - Vertical">
                    <option value="rmsVert_g">RMS Vertical</option>
                    <option value="peakVert_g">Peak Vertical</option>
                    <option value="peakToPeakVert_g">Peak-to-Peak Vertical</option>
                    <option value="crestFactorVert_g">Crest Factor Vertical</option>
                  </optgroup>
                  <optgroup label="Velocity (in/s)">
                    <option value="rmsAxial_inps">RMS Axial Velocity</option>
                    <option value="rmsHoriz_inps">RMS Horizontal Velocity</option>
                    <option value="rmsVert_inps">RMS Vertical Velocity</option>
                    <option value="peakToPeakAxial_inps">Peak-to-Peak Axial Velocity</option>
                    <option value="peakToPeakHoriz_inps">Peak-to-Peak Horizontal Velocity</option>
                    <option value="peakToPeakVert_inps">Peak-to-Peak Vertical Velocity</option>
                  </optgroup>
                  <optgroup label="Environmental">
                    <option value="temperature_C">Temperature (°C)</option>
                    <option value="batteryVoltage_V">Battery Voltage (V)</option>
                    <option value="sensorSignalStrength_dBm">Signal Strength (dBm)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="vds-content-area">
          {/* Trend Chart Panel */}
          <div className="vds-chart-panel">
            <div className="vds-chart-header">
              <h2 className="vds-chart-title">
                <TrendingUp className="vds-chart-icon" />
                <span className="vds-chart-title-text">{metricLabels[selectedMetric]} Trend Analysis</span>
              </h2>
              <div className="vds-time-range-group">
                {(['7d', '1m', '1y'] as const).map((period) => (
                  <button key={period} onClick={() => setTimeRange(period)} className={`vds-time-range-button ${timeRange === period ? 'vds-time-range-button-active' : ''}`}>
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <TrendChart data={filteredTrendData} onPointClick={handleTrendClick} isLoading={isTrendLoading} error={trendError} />
            
            {/* Date Range Slider */}
            {maxDataLength > 0 && !isTrendLoading && !trendError && (
              <div className="vds-range-slider-container">
                <div className="vds-range-slider-header">
                  <span className="vds-range-label">Date Range Filter</span>
                  <span className="vds-range-display">
                    {trendData[rangeStartIndex] && formatTimestamp(trendData[rangeStartIndex].timestamp)} — {trendData[rangeEndIndex] && formatTimestamp(trendData[rangeEndIndex].timestamp)}
                  </span>
                </div>
                <div className="vds-range-slider-track">
                  <div className="vds-range-labels">
                    <span className="vds-range-edge-label">Start</span>
                    <span className="vds-range-edge-label">End</span>
                  </div>
                  <div className="vds-dual-slider-wrapper">
                    <input
                      type="range"
                      min={0}
                      max={maxDataLength - 1}
                      value={rangeStartIndex}
                      onChange={(e) => handleRangeStartChange(Number(e.target.value))}
                      className="vds-range-slider vds-range-slider-start"
                      aria-label="Range start date"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxDataLength - 1}
                      value={rangeEndIndex}
                      onChange={(e) => handleRangeEndChange(Number(e.target.value))}
                      className="vds-range-slider vds-range-slider-end"
                      aria-label="Range end date"
                    />
                    <div
                      className="vds-range-highlight"
                      style={{
                        // @ts-ignore
                        ['--highlight-left' as any]: `${(rangeStartIndex / (maxDataLength - 1)) * 100}%`,
                        ['--highlight-width' as any]: `${((rangeEndIndex - rangeStartIndex) / (maxDataLength - 1)) * 100}%`
                      }}
                    />
                  </div>
                  <div className="vds-range-dates">
                    <span>{trendData[0] && formatTimestamp(trendData[0].timestamp)}</span>
                    <span>{trendData[maxDataLength - 1] && formatTimestamp(trendData[maxDataLength - 1].timestamp)}</span>
                  </div>
                </div>
                <div className="vds-range-info">
                  <span>Showing {filteredTrendData.length} of {maxDataLength} data points</span>
                  <button 
                    className="vds-reset-range-btn"
                    onClick={() => { setRangeStartIndex(0); setRangeEndIndex(maxDataLength - 1); }}
                  >
                    Reset Range
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Waveform Analysis Panel */}
          {waveformData && (
            <div className="vds-chart-panel" ref={waveformPanelRef} style={{ position: 'relative' }}>
              {isWaveformLoading && (
                <div className="vds-spinner-overlay">
                  <div className="vds-spinner" />
                </div>
              )}
              <div className="vds-signal-header">
                <div className="vds-signal-info">
                  <h3 className="vds-signal-title">Detailed Waveform Analysis</h3>
                  <p className="vds-signal-timestamp">
                    Sensor: <strong>{clickedSensorId}</strong> | Selected timestamp: {(() => {
                      const date = new Date(waveformData.timestamp * 1000);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(2, '0');
                      return `${year}-${month}-${day} ${hours}:${minutes}`;
                    })()}
                  </p>
                </div>
                <div className="vds-axis-buttons">
                  {(['axial', 'horiz', 'vert'] as const).map((axis) => (
                    <button key={axis} onClick={() => setSelectedAxis(axis)} className={`vds-axis-button ${selectedAxis === axis ? 'vds-axis-button-active' : ''}`}>
                      {axis === 'axial' ? 'Axial' : axis === 'horiz' ? 'Horiz' : 'Vert'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="vds-charts-container">
                <TimeWaveformChart data={waveformData.data[selectedAxis]} sampleRate_Hz={waveformData.config.sampleRate_Hz} axisLabel={selectedAxis === 'horiz' ? 'Horizontal' : selectedAxis === 'vert' ? 'Vertical' : 'Axial'} />
                <FFTChart data={waveformData.data[selectedAxis]} sampleRate_Hz={waveformData.config.sampleRate_Hz} axisLabel={selectedAxis === 'horiz' ? 'Horizontal' : selectedAxis === 'vert' ? 'Vertical' : 'Axial'} />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isWaveformLoading && (
            <div className="vds-chart-panel">
              <div className="vds-loading">
                <Activity />
                <p>Loading waveform data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {waveformError && (
            <div className="vds-chart-panel">
              <div className="vds-error-state">
                <h3 className="vds-error-title">Error</h3>
                <p className="vds-error-message">{waveformError}</p>
              </div>
            </div>
          )}

          {/* No Raw Waveform Available */}
          {noRawWaveform && (
            <div className="vds-chart-panel">
              <div className="vds-empty-state">
                <div className="vds-empty-icon">⚠</div>
                <h3 className="vds-empty-title">Waveform Unavailable</h3>
                <p className="vds-empty-subtitle">Raw waveform data is not available for this timestamp</p>
              </div>
            </div>
          )}

          {/* Empty State - No Selection */}
          {!waveformData && !isWaveformLoading && !waveformError && !noRawWaveform && (
            <div className="vds-chart-panel">
              <div className="vds-empty-state">
                <div className="vds-empty-icon">〰</div>
                <h3 className="vds-empty-title">Click a point on the trend chart to analyze signal details</h3>
                <p className="vds-empty-subtitle">FFT & Time Domain Unavailable Without Selection</p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

interface TrendChartProps {
  data: TrendDataPoint[];
  onPointClick: (event: any) => void;
  isLoading: boolean;
  error: string | null;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, onPointClick, isLoading, error }) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current || isLoading || error || data.length === 0) {
      return;
    }

    // Helper function to format Unix timestamp to YYYY-DD-MM HH:MM
    const formatTimestamp = (unixSeconds: number): string => {
      const date = new Date(unixSeconds * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // Separate points with waveforms for highlighting
    const pointsWithWaveform = data.filter(d => d.hasRawWaveform);

    const plotData: any[] = [];
    const primaryColor = '#6366f1';
    const waveformColor = '#10b981'; // Green color for waveform points

    // Main line trace with ALL points (so line is continuous)
    plotData.push({
      x: data.map(d => new Date(d.timestamp * 1000)),
      y: data.map(d => d.value),
      type: 'scattergl',
      mode: 'lines+markers',
      name: 'Trend',
      line: { color: primaryColor, width: 2 },
      marker: { size: 6, color: primaryColor },
      customdata: data.map(p => ({ 
        timestamp: p.timestamp, 
        hasRawWaveform: p.hasRawWaveform,
        formattedTimestamp: formatTimestamp(p.timestamp)
      })),
      hovertemplate: 'Timestamp: %{customdata.formattedTimestamp}<br>Value: %{y:.4f}<extra></extra>',
    });

    // Overlay larger markers for waveform points (on top of the line)
    if (pointsWithWaveform.length > 0) {
      plotData.push({
        x: pointsWithWaveform.map(d => new Date(d.timestamp * 1000)),
        y: pointsWithWaveform.map(d => d.value),
        type: 'scattergl',
        mode: 'markers',
        name: 'Waveform Available',
        marker: { 
          size: 12, 
          color: waveformColor, 
          line: { color: 'white', width: 2 } 
        },
        customdata: pointsWithWaveform.map(p => ({ 
          timestamp: p.timestamp, 
          hasRawWaveform: p.hasRawWaveform,
          formattedTimestamp: formatTimestamp(p.timestamp)
        })),
        hovertemplate: 'Timestamp: %{customdata.formattedTimestamp}<br>Value: %{y:.4f}<br><b>🟢 Click to view waveform!</b><extra></extra>',
        showlegend: true,
      });
    }

    const layout = {
      title: 'Trend Data - Click orange points to view waveform',
      xaxis: { 
        title: 'Date & Time',
        type: 'date',
        tickformat: '%b %d %H:%M',
        tickangle: -30,
        gridcolor: '#F0F0F0',
        showgrid: true,
      },
      yaxis: { title: 'Value' },
      height: 400,
      margin: { t: 50, r: 20, b: 80, l: 60 },
      hovermode: 'closest' as const,
      dragmode: 'zoom' as const,
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#f9fafb',
      showlegend: true,
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
    };

    const config = { 
      responsive: true, 
      displayModeBar: true,
      displaylogo: false,
    };

    Plotly.newPlot(plotRef.current, plotData as any, layout as any, config);

    // Add click event listener
    const handlePlotlyClick = (data: any): void => {
      console.log('Plot clicked:', data);
      onPointClick(data);
    };

    (plotRef.current as any).on('plotly_click', handlePlotlyClick);

    return () => {
      if (plotRef.current) {
        (plotRef.current as any).off?.('plotly_click', handlePlotlyClick);
        Plotly.purge(plotRef.current);
      }
    };
  }, [data, onPointClick, isLoading, error]);

  if (isLoading) {
    return (
      <div className="vds-loading">
        <Activity />
        <p>Loading trend data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vds-error-state">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="vds-empty-state">
        <p>No trend data available</p>
      </div>
    );
  }

  return <div ref={plotRef} className="vds-trend-chart" />;
};
