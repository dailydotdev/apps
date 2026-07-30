import React, { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { useAutoResizeTextarea } from './useAutoResizeTextarea';

interface TestTextareaProps {
  value: string;
  maxHeight?: number;
}

const TestTextarea = ({
  value,
  maxHeight,
}: TestTextareaProps): React.ReactElement => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutoResizeTextarea(textareaRef, value, { maxHeight });

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
  let scrollHeight = 64;

  beforeEach(() => {
    scrollHeight = 64;
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });
  });

  it('resizes the textarea to its scroll height', () => {
    const { rerender } = render(<TestTextarea value="Short title" />);
    const textarea = screen.getByRole('textbox', { name: 'Composer text' });

    expect(textarea).toHaveStyle({ height: '64px' });

    scrollHeight = 96;
    rerender(<TestTextarea value="Longer title" />);

    expect(textarea).toHaveStyle({ height: '96px' });
  });

  it('caps the textarea height and enables vertical scrolling', () => {
    scrollHeight = 200;

    render(<TestTextarea value="Long commentary" maxHeight={144} />);

    expect(screen.getByRole('textbox', { name: 'Composer text' })).toHaveStyle({
      height: '144px',
      maxHeight: '144px',
      overflowY: 'auto',
    });
  });
});
