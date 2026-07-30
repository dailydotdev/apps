import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  APP_URL,
  LandingAppInstall,
  QR_PATH,
  VISIBLE_LABEL,
} from './LandingAppInstall';
import {
  decodeMatrix,
  parseRectPath,
} from '../../../../../__tests__/helpers/qr';

describe('LandingAppInstall', () => {
  it('exposes the app-store destination as a link, not only as a QR code', () => {
    render(<LandingAppInstall />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', APP_URL);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps the visible label inside the accessible name (WCAG 2.5.3)', () => {
    render(<LandingAppInstall />);

    expect(screen.getByText(VISIBLE_LABEL)).toBeInTheDocument();
    // A voice-control user activates this by speaking the words they can see,
    // so the accessible name has to contain the caption verbatim.
    expect(
      screen.getByRole('link', {
        name: new RegExp(VISIBLE_LABEL, 'i'),
      }),
    ).toBeInTheDocument();
  });

  it('names the destination as well as the gesture', () => {
    render(<LandingAppInstall />);

    expect(
      screen.getByRole('link', { name: /iOS or Android/i }),
    ).toBeInTheDocument();
  });
  // The matrix is a hand-flattened constant while the destination lives in
  // APP_URL; nothing else notices if one moves without the other. Decoding the
  // committed modules the way a scanner would makes CI catch that drift.
  it('keeps the QR matrix in sync with APP_URL', () => {
    expect(decodeMatrix(parseRectPath(QR_PATH))).toBe(APP_URL);
  });
});
