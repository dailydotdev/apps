import React from 'react';
import { render, screen } from '@testing-library/react';
import { APP_URL, LandingAppInstall } from './LandingAppInstall';

describe('LandingAppInstall', () => {
  it('exposes the app-store destination as a link, not only as a QR code', () => {
    render(<LandingAppInstall />);

    const link = screen.getByRole('link', {
      name: 'Get the daily.dev app for iOS or Android',
    });

    expect(link).toHaveAttribute('href', APP_URL);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('names the link by its destination, not by the scan instruction', () => {
    render(<LandingAppInstall />);

    // The caption explains how to use the code, which is no help to anyone who
    // cannot scan it, so it must not end up as the link's accessible name.
    expect(screen.getByText('Scan to get the app')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /scan/i }),
    ).not.toBeInTheDocument();
  });
});
