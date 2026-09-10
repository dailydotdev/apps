import React from 'react';
import { render } from '@testing-library/react';
import { LinkIcon } from '../icons';
import { CopyStateIcon } from './CopyStateIcon';

const layers = (container: HTMLElement): string[] => {
  const grid = container.querySelector('span.inline-grid');

  if (!grid) {
    throw new Error('CopyStateIcon did not render its grid');
  }

  return Array.from(grid.children).map(
    (child) => child.getAttribute('class') ?? '',
  );
};

describe('CopyStateIcon', () => {
  it('rests on the given glyph with the confirmation hidden', () => {
    const { container } = render(
      <CopyStateIcon copied={false} icon={LinkIcon} />,
    );
    const [resting, confirmation] = layers(container);

    expect(resting).not.toContain('opacity-0');
    expect(confirmation).toContain('opacity-0');
  });

  it('swaps to a green confirmation once copied', () => {
    const { container } = render(<CopyStateIcon copied icon={LinkIcon} />);
    const [resting, confirmation] = layers(container);

    expect(resting).toContain('opacity-0');
    expect(confirmation).not.toContain('opacity-0');
    expect(confirmation).toContain('text-status-success');
  });

  it('keeps both glyphs in one grid cell so the button never resizes', () => {
    const { container } = render(<CopyStateIcon copied={false} />);

    layers(container).forEach((className) => {
      expect(className).toContain('col-start-1');
      expect(className).toContain('row-start-1');
    });
  });
});
