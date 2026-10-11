import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useFormTouched } from './useFormTouched';

const Harness = ({ isSaving = false }: { isSaving?: boolean }) => {
  const isTouched = useFormTouched('form', true, isSaving);

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

  it('turns untouched again once a save finishes', () => {
    const { rerender } = render(<Harness />);
    fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'a' } });
    expect(screen.getByText('touched')).toBeInTheDocument();

    rerender(<Harness isSaving />);
    expect(screen.getByText('touched')).toBeInTheDocument();

    rerender(<Harness />);
    expect(screen.getByText('untouched')).toBeInTheDocument();

    fireEvent.input(screen.getByLabelText('Name'), { target: { value: 'b' } });
    expect(screen.getByText('touched')).toBeInTheDocument();
  });
});
