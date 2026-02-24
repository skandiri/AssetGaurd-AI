import React from 'react';
jest.mock('plotly.js-dist-min');
import { render, screen } from '@testing-library/react';
import App from '../App';
import { ToastProvider } from '../context/ToastContext';

test('renders Vibration Diagnostic Suite title', () => {
  render(
    <ToastProvider>
      <App />
    </ToastProvider>
  );
  expect(screen.getByText(/Vibration Diagnostic Suite/i)).toBeInTheDocument();
});
