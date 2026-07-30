import React, { useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { useAutoResizeTextarea } from './useAutoResizeTextarea';

const TestTextarea = ({ value }: { value: string }): React.ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoResizeTextarea(textareaRef, value);

  return (
    <textarea
      ref={textareaRef}
      aria-label="Composer text"
      value={value}
      readOnly
    />
  );
};

describe('useAutoResizeTextarea', () => {
  const nativeResizeObserver = global.ResizeObserver;
  let scrollHeight = 64;
  let clientWidth = 400;
  let triggerResize: () => void = () => undefined;

  beforeEach(() => {
    scrollHeight = 64;
    clientWidth = 400;
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });
    Object.defineProperty(HTMLTextAreaElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => clientWidth,
    });
    global.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
      const observer = {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as ResizeObserver;
      triggerResize = () => callback([], observer);

      return observer;
    }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    global.ResizeObserver = nativeResizeObserver;
  });

  it('resizes the textarea to its scroll height', () => {
    const { rerender } = render(<TestTextarea value="Short title" />);
    const textarea = screen.getByRole('textbox', { name: 'Composer text' });

    expect(textarea).toHaveStyle({ height: '64px' });

    scrollHeight = 96;
    rerender(<TestTextarea value="Longer title" />);

    expect(textarea).toHaveStyle({ height: '96px' });
  });

  it('resizes when the textarea width changes', () => {
    render(<TestTextarea value="Long commentary" />);
    const textarea = screen.getByRole('textbox', { name: 'Composer text' });

    scrollHeight = 144;
    clientWidth = 200;
    act(() => triggerResize());

    expect(textarea).toHaveStyle({ height: '144px' });
  });
});
