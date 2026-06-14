import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtensionShowcase } from './ExtensionShowcase';
import { defaultExtensionShowcaseFeatures } from './defaultFeatures';

describe('ExtensionShowcase', () => {
  it('shows the first feature detail by default', () => {
    render(<ExtensionShowcase />);

    const [first] = defaultExtensionShowcaseFeatures;
    expect(
      screen.getByRole('heading', { name: first.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(first.description)).toBeInTheDocument();
  });

  it('swaps the detail panel when a feature is selected', () => {
    const onFeatureChange = jest.fn();
    render(<ExtensionShowcase onFeatureChange={onFeatureChange} />);

    const target = defaultExtensionShowcaseFeatures[2];
    // both desktop dock and mobile strip render a button per feature
    const [button] = screen.getAllByRole('button', { name: target.label });
    fireEvent.click(button);

    expect(onFeatureChange).toHaveBeenCalledWith(target.id);
    expect(
      screen.getByRole('heading', { name: target.title }),
    ).toBeInTheDocument();
  });

  it('respects defaultFeatureId', () => {
    const target = defaultExtensionShowcaseFeatures[3];
    render(<ExtensionShowcase defaultFeatureId={target.id} />);

    expect(
      screen.getByRole('heading', { name: target.title }),
    ).toBeInTheDocument();
  });

  it('hides the CTA when ctaLabel is empty', () => {
    render(<ExtensionShowcase ctaLabel="" />);

    expect(
      screen.queryByRole('link', { name: /add to browser/i }),
    ).not.toBeInTheDocument();
  });
});
