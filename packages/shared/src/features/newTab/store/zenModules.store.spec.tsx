import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { useZenModules } from './zenModules.store';

const Probe = (): JSX.Element => {
  const { toggles, setToggle, reset } = useZenModules();
  return (
    <div>
      <span data-testid="mustReads">{String(toggles.mustReads)}</span>
      <span data-testid="todos">{String(toggles.todos)}</span>
      <span data-testid="weather">{String(toggles.weather)}</span>
      <button type="button" onClick={() => setToggle('todos', true)}>
        show-todos
      </button>
      <button type="button" onClick={() => setToggle('weather', true)}>
        show-weather
      </button>
      <button type="button" onClick={reset}>
        reset
      </button>
    </div>
  );
};

describe('zenModules.store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to content-first modules', () => {
    render(<Probe />);
    expect(screen.getByTestId('mustReads')).toHaveTextContent('true');
    expect(screen.getByTestId('todos')).toHaveTextContent('false');
    expect(screen.getByTestId('weather')).toHaveTextContent('false');
  });

  it('persists toggles and resets back to defaults', () => {
    render(<Probe />);
    act(() => {
      screen.getByText('show-todos').click();
      screen.getByText('show-weather').click();
    });
    expect(screen.getByTestId('todos')).toHaveTextContent('true');
    expect(screen.getByTestId('weather')).toHaveTextContent('true');

    act(() => {
      screen.getByText('reset').click();
    });
    expect(screen.getByTestId('todos')).toHaveTextContent('false');
    expect(screen.getByTestId('weather')).toHaveTextContent('false');
  });
});
