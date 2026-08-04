import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeField } from './CodeField';

const onSubmit = jest.fn();
const onChange = jest.fn();

const setup = (props: { disabled?: boolean; defaultValue?: string } = {}) =>
  render(<CodeField onSubmit={onSubmit} onChange={onChange} {...props} />);

const getInput = () => screen.getByRole('textbox') as HTMLInputElement;

const getBoxes = () =>
  Array.from(document.querySelectorAll('[aria-hidden="true"]')).map(
    (box) => box.textContent,
  );

describe('CodeField', () => {
  beforeEach(() => {
    onSubmit.mockReset();
    onChange.mockReset();
  });

  it('should offer the whole code to the platform through one field', () => {
    setup();

    const input = getInput();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(input).toHaveAttribute('autocomplete', 'one-time-code');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('name', 'code');
    expect(input).toHaveAccessibleName('Verification code');
  });

  it('should keep the field fillable rather than hiding it', () => {
    setup();

    const input = getInput();
    expect(input).not.toHaveAttribute('hidden');
    expect(input.className).not.toMatch(/(^|\s)(hidden|invisible)(\s|$)/);
    expect(input).not.toHaveAttribute('tabindex');
  });

  it('should not cap length so a prose paste survives until it is sanitized', () => {
    setup();

    expect(getInput()).not.toHaveAttribute('maxlength');
  });

  it('should render the digits in presentational boxes', () => {
    setup();

    expect(getBoxes()).toEqual(['', '', '', '', '', '']);
  });

  it('should fill the boxes left to right and drop anything but digits', async () => {
    setup();

    await userEvent.type(getInput(), '12a3');

    expect(getBoxes()).toEqual(['1', '2', '3', '', '', '']);
    expect(onChange).toHaveBeenLastCalledWith('123');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should remove the last digit on backspace', async () => {
    setup();

    await userEvent.type(getInput(), '123{backspace}');

    expect(getBoxes()).toEqual(['1', '2', '', '', '', '']);
  });

  it('should submit a whole code written in at once', () => {
    setup();

    fireEvent.change(getInput(), { target: { value: '725432' } });

    expect(getBoxes()).toEqual(['7', '2', '5', '4', '3', '2']);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('725432');
  });

  it('should submit once when one insertion arrives as two events', () => {
    setup();

    fireEvent.change(getInput(), { target: { value: '725432' } });
    fireEvent.change(getInput(), { target: { value: '725432' } });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should take the digits out of a code pasted with surrounding text', () => {
    setup();

    fireEvent.change(getInput(), {
      target: { value: 'Your code is 725 432!' },
    });

    expect(getBoxes()).toEqual(['7', '2', '5', '4', '3', '2']);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('725432');
  });

  it('should ignore a write that carries no digits', () => {
    setup();

    fireEvent.change(getInput(), { target: { value: 'no code here' } });

    expect(getBoxes()).toEqual(['', '', '', '', '', '']);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should render a complete default value without submitting it', () => {
    setup({ defaultValue: '725432' });

    expect(getBoxes()).toEqual(['7', '2', '5', '4', '3', '2']);
    expect(getInput()).toHaveValue('725432');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should render a partial default value without submitting it', () => {
    setup({ defaultValue: '725' });

    expect(getBoxes()).toEqual(['7', '2', '5', '', '', '']);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should snap a collapsed mid-string caret back to the end', async () => {
    setup();

    const input = getInput();
    await userEvent.type(input, '123');
    input.setSelectionRange(1, 1);
    fireEvent.select(input);

    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(3);
  });

  it('should leave a range selection alone', async () => {
    setup();

    const input = getInput();
    await userEvent.type(input, '123');
    input.setSelectionRange(0, 3);
    fireEvent.select(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(3);
  });

  it('should take no input while disabled', async () => {
    setup({ disabled: true });

    expect(getInput()).toBeDisabled();

    await userEvent.type(getInput(), '725432');

    expect(getBoxes()).toEqual(['', '', '', '', '', '']);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
