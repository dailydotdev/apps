import React from 'react';
import { render, screen } from '@testing-library/react';
import { NewTabModeRenderer } from './NewTabModeRenderer';

describe('NewTabModeRenderer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps the feed visible when Focus mode has no active session or schedule', () => {
    window.localStorage.setItem('newtab:mode', JSON.stringify('focus'));

    render(
      <NewTabModeRenderer>
        <div>Feed content</div>
      </NewTabModeRenderer>,
    );

    expect(screen.getByText('Feed content')).toBeInTheDocument();
  });

  it('keeps the feed visible during active hours when no focus session is running', () => {
    const now = new Date();
    window.localStorage.setItem('newtab:mode', JSON.stringify('focus'));
    window.localStorage.setItem(
      'newtab:focus-schedule',
      JSON.stringify({
        enabled: true,
        windowsMode: 'focus_during',
        pauseUntil: null,
        windows: [
          {
            weekday: now.getDay(),
            start: '00:00',
            end: '23:59',
          },
        ],
      }),
    );

    render(
      <NewTabModeRenderer>
        <div>Feed content</div>
      </NewTabModeRenderer>,
    );

    expect(screen.getByText('Feed content')).toBeInTheDocument();
    expect(screen.queryByText('Ready to focus?')).not.toBeInTheDocument();
  });
});
