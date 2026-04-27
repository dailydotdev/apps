import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FirstSessionDevToggle } from './FirstSessionDevToggle';

beforeEach(() => {
  window.localStorage.clear();
});

describe('FirstSessionDevToggle', () => {
  it('defaults to forced ON when no override is set', () => {
    render(<FirstSessionDevToggle realIsFirstSession={false} />);
    expect(
      screen.getByRole('button', { name: /first session: on \(forced\)/i }),
    ).toBeInTheDocument();
  });

  it('cycles forced ON -> forced OFF -> real -> forced ON', () => {
    const { rerender } = render(
      <FirstSessionDevToggle realIsFirstSession={false} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /first session: on \(forced\)/i }),
    );
    rerender(<FirstSessionDevToggle realIsFirstSession={false} />);
    expect(
      screen.getByRole('button', { name: /first session: off \(forced\)/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /first session: off \(forced\)/i }),
    );
    rerender(<FirstSessionDevToggle realIsFirstSession={false} />);
    expect(
      screen.getByRole('button', { name: /first session: off \(real\)/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /first session: off \(real\)/i }),
    );
    rerender(<FirstSessionDevToggle realIsFirstSession={false} />);
    expect(
      screen.getByRole('button', { name: /first session: on \(forced\)/i }),
    ).toBeInTheDocument();
  });

  it('persists the forced state across remounts via localStorage', () => {
    const { unmount } = render(
      <FirstSessionDevToggle realIsFirstSession={false} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /first session: on \(forced\)/i }),
    );
    unmount();

    render(<FirstSessionDevToggle realIsFirstSession={false} />);
    expect(
      screen.getByRole('button', { name: /first session: off \(forced\)/i }),
    ).toBeInTheDocument();
  });
});
