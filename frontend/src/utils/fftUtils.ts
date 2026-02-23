// FFT computation utility for vibration waveform analysis
// Implements industry-standard scaling for single-sided RMS spectrum
// with Hanning window amplitude correction
//
// References:
//   - ISO 10816 vibration severity standards
//   - Standard FFT scaling for vibration analysis:
//     RMS[k] = (2 * |X[k]| / N) * window_correction / sqrt(2)
//
// Corrections applied:
//   1. Single-sided spectrum (×2): folds negative frequency energy into positive side
//   2. Hanning window amplitude correction (×2): compensates for window's mean of 0.5
//   3. Peak-to-RMS conversion (÷√2): industry standard for vibration spectra

import FFT from 'fft.js';

export interface FFTResult {
  frequencies: number[];
  magnitudes: number[];
}

export function computeFFT(samples: number[], sampleRate_Hz: number): FFTResult {
  const N = samples.length; // Should be 16384 (power of 2)

  // Step 1: Apply Hanning window to reduce spectral leakage
  // Hanning: w(n) = 0.5 * (1 - cos(2πn / (N-1)))
  // Amplitude correction factor = 1 / mean(window) = 1 / 0.5 = 2.0
  const windowed = new Array(N);
  for (let i = 0; i < N; i++) {
    const windowValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    windowed[i] = samples[i] * windowValue;
  }
  const windowCorrectionFactor = 2.0; // 1 / mean(Hanning window)

  // Step 2: Compute FFT
  const fft = new FFT(N);
  const output = fft.createComplexArray();
  fft.realTransform(output, windowed);
  fft.completeSpectrum(output);

  // Step 3: Calculate single-sided RMS magnitude spectrum (0 to Nyquist)
  const halfN = N / 2;
  const frequencies: number[] = new Array(halfN);
  const magnitudes: number[] = new Array(halfN);
  const sqrt2 = Math.sqrt(2);

  for (let k = 0; k < halfN; k++) {
    const real = output[2 * k];
    const imag = output[2 * k + 1];

    // Raw magnitude normalized by N
    let mag = Math.sqrt(real * real + imag * imag) / N;

    // Single-sided correction: multiply by 2 for all bins except DC (k=0)
    // This accounts for the energy in the negative frequency mirror
    if (k > 0) {
      mag *= 2;
    }

    // Window amplitude correction: compensate for Hanning window attenuation
    mag *= windowCorrectionFactor;

    // Convert from peak amplitude to RMS amplitude (industry standard)
    mag /= sqrt2;

    frequencies[k] = k * (sampleRate_Hz / N);
    magnitudes[k] = mag;
  }

  return { frequencies, magnitudes };
}
