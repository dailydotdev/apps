import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFormTouched } from './useFormTouched';

const Harness = ({ savedKey }: { savedKey?: unknown }) => {
  const isTouched = useFormTouched('form', true, savedKey);

  return (
    <>
      <form id="form">
        <input aria-label="Name" />
      </form>
      <span>{isTouched ? 'touched' : 'untouched'}</span>
    </>
  );
};

describe('useFormTouched', () => {
  it('turns touched on the first edit inside the form', () => {
    render(<Harness />);
    expect(screen.getByText('untouched')).toBeInTheDocument();

    fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'a' } });

    expect(screen.getByText('touched')).toBeInTheDocument();
  });

  it('turns untouched again once a save succeeds, not when one fails', () => {
    const { rerender } = render(<Harness />);
    fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'a' } });
    expect(screen.getByText('touched')).toBeInTheDocument();

    // A failed save leaves the saved key as it was.
    rerender(<Harness />);
    expect(screen.getByText('touched')).toBeInTheDocument();

    const saved = { id: 1 };
    rerender(<Harness savedKey={saved} />);
    expect(screen.getByText('untouched')).toBeInTheDocument();

    fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'b' } });
    expect(screen.getByText('touched')).toBeInTheDocument();

    // The next save clears the mutation's data while it runs, then fails.
    rerender(<Harness />);
    expect(screen.getByText('touched')).toBeInTheDocument();
  });
});
