import React from 'react';
import { render } from '@testing-library/react';
import { CopyStateIcon } from './CopyStateIcon';
import { LinkIcon } from '../icons';

const glyphs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('svg'));

describe('CopyStateIcon', () => {
  it('rests on the copy glyph and hides the confirmation', () => {
    const { container } = render(<CopyStateIcon copied={false} />);

    const [idle, confirmation] = glyphs(container);
    expect(idle.getAttribute('class')).not.toContain('opacity-0');
    expect(confirmation).toHaveAttribute(
      'class',
      expect.stringContaining('opacity-0'),
    );
  });

  it('spins the avocado arrow in once a copy lands', () => {
    const { container } = render(<CopyStateIcon copied />);

    const [idle, confirmation] = glyphs(container);
    expect(idle).toHaveAttribute('class', expect.stringContaining('opacity-0'));
    expect(confirmation).toHaveAttribute(
      'class',
      expect.stringContaining('animate-copy-confirm'),
    );
    expect(confirmation).toHaveAttribute(
      'class',
      expect.stringContaining('text-accent-avocado-default'),
    );
  });

  it('rests on the glyph it is given, so a link control still reads as one', () => {
    const { container } = render(
      <CopyStateIcon copied={false} idle={LinkIcon} />,
    );

    // Both layers are rendered at once and share one grid cell, so the swap
    // cannot shift the label beside them.
    const [idle, confirmation] = glyphs(container);
    expect(idle.getAttribute('class')).not.toContain('opacity-0');
    expect(confirmation).toHaveAttribute(
      'class',
      expect.stringContaining('opacity-0'),
    );
  });
});
