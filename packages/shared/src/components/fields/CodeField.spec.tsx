import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CodeField } from './CodeField';

const onSubmit = jest.fn();

const setup = () => render(<CodeField onSubmit={onSubmit} />);
const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

describe('CodeField', () => {
  beforeEach(() => {
    onSubmit.mockReset();
  });

  it('should offer the first box to the platform as the code field', () => {
    setup();

    const [first, ...rest] = boxes();
    expect(first).toHaveAttribute('autocomplete', 'one-time-code');
    expect(first).toHaveAttribute('inputmode', 'numeric');
    // `tel` would not be the pair Safari's AutoFill is documented against.
    expect(first).toHaveAttribute('type', 'text');
    rest.forEach((box) => {
      expect(box).toHaveAttribute('autocomplete', 'off');
    });
  });

  it('should not cap any box, so a whole code written in survives', () => {
    setup();

    boxes().forEach((box) => expect(box).not.toHaveAttribute('maxlength'));
  });

  // iOS AutoFill and Gboard's clipboard chip both write the code straight into
  // the focused box rather than firing a paste event.
  it('should spread a code written into the first box and submit it', () => {
    setup();

    fireEvent.change(boxes()[0], { target: { value: '725432' } });

    expect(boxes().map((box) => box.value)).toEqual([
      '7',
      '2',
      '5',
      '4',
      '3',
      '2',
    ]);
    expect(onSubmit).toHaveBeenCalledWith('725432');
  });

  it('should spread a code written into a later box too', () => {
    setup();

    fireEvent.change(boxes()[3], { target: { value: '725432' } });

    expect(onSubmit).toHaveBeenCalledWith('725432');
  });

  // A soft keyboard or IME whose keydown cannot be cancelled delivers its
  // character through `input`, so a write shorter than the code is a keystroke.
  it('should treat a write shorter than the code as a typed digit', async () => {
    setup();

    fireEvent.change(boxes()[0], { target: { value: '7' } });

    expect(boxes().map((box) => box.value)).toEqual(['7', '', '', '', '', '']);
    await waitFor(() => expect(boxes()[1]).toHaveFocus());
  });

  it('should not spread a second digit written into the same box', () => {
    setup();

    fireEvent.change(boxes()[0], { target: { value: '7' } });
    fireEvent.change(boxes()[0], { target: { value: '77' } });

    expect(boxes()[1]).toHaveValue('');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should take the digits out of a code pasted with surrounding text', () => {
    setup();

    fireEvent.paste(boxes()[0], {
      clipboardData: { getData: () => 'Your code is 725432\n' },
    });

    expect(onSubmit).toHaveBeenCalledWith('725432');
  });

  it('should keep a partial paste in place and focus the next box', async () => {
    setup();

    fireEvent.paste(boxes()[0], {
      clipboardData: { getData: () => 'code: 72' },
    });

    expect(boxes().map((box) => box.value)).toEqual(['7', '2', '', '', '', '']);
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(boxes()[2]).toHaveFocus());
  });

  it('should ignore a paste that carries no digits', () => {
    setup();

    fireEvent.paste(boxes()[0], {
      clipboardData: { getData: () => 'no code here' },
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(boxes()[0]).toHaveValue('');
  });

  it('should still take one digit per box when typed', () => {
    setup();

    fireEvent.keyDown(boxes()[0], { key: '7' });
    expect(boxes()[0]).toHaveValue('7');
  });
});
