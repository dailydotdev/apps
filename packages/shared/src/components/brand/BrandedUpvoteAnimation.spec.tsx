import React from 'react';
import { render } from '@testing-library/react';
import type { BrandColors, UpvoteAnimationConfig } from '../../lib/brand';
import { BrandedUpvoteAnimation } from './BrandedUpvoteAnimation';

const colors: BrandColors = {
  primary: '#6e40c9',
  secondary: '#1f6feb',
};

const config: UpvoteAnimationConfig = {
  type: 'confetti',
  particleCount: 10,
  duration: 1500,
};

describe('BrandedUpvoteAnimation', () => {
  it('renders nothing while isActive is false', () => {
    const { container } = render(
      <BrandedUpvoteAnimation
        isActive={false}
        colors={colors}
        config={config}
      />,
    );
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('mounts the canvas once isActive becomes true', () => {
    const { container, rerender } = render(
      <BrandedUpvoteAnimation
        isActive={false}
        colors={colors}
        config={config}
      />,
    );
    expect(container.querySelector('canvas')).toBeNull();

    rerender(
      <BrandedUpvoteAnimation isActive colors={colors} config={config} />,
    );

    expect(container.querySelector('canvas')).not.toBeNull();
  });
});
