import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useNewTabMode } from './newTabMode.store';

const Probe = (): JSX.Element => {
  const { mode, setMode } = useNewTabMode();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button type="button" onClick={() => setMode('zen')}>
        go-zen
      </button>
    </div>
  );
};

describe('newTabMode.store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to discover when nothing is stored', () => {
    render(<Probe />);
    expect(screen.getByTestId('mode')).toHaveTextContent('discover');
  });

  it('migrates the legacy focus-mode=true flag to zen', () => {
    window.localStorage.setItem('newtab:focus-mode', JSON.stringify(true));
    render(<Probe />);
    expect(screen.getByTestId('mode')).toHaveTextContent('zen');
    expect(window.localStorage.getItem('newtab:focus-mode')).toBeNull();
  });

  it('migrates the legacy focus-mode=false flag to discover', () => {
    window.localStorage.setItem('newtab:focus-mode', JSON.stringify(false));
    render(<Probe />);
    expect(screen.getByTestId('mode')).toHaveTextContent('discover');
    expect(window.localStorage.getItem('newtab:focus-mode')).toBeNull();
  });

  it('persists mode changes to storage', () => {
    render(<Probe />);
    act(() => {
      screen.getByText('go-zen').click();
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('zen');
    expect(window.localStorage.getItem('newtab:mode')).toBe('"zen"');
  });
});
