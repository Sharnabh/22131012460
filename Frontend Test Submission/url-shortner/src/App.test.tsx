import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders URL Shortener app', () => {
  render(<App />);
  const titleElement = screen.getByText(/URL Shortener/i);
  expect(titleElement).toBeInTheDocument();
});
