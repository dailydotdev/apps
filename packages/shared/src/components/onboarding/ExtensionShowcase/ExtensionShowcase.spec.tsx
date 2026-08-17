import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtensionShowcase } from './ExtensionShowcase';
import { defaultExtensionShowcaseFeatures } from './defaultFeatures';
import type { ExtensionShowcaseFeature } from './types';

const soloFeature: ExtensionShowcaseFeature = {
  id: 'solo',
  label: 'Solo',
  icon: <span />,
  description: 'Solo description',
};

describe('ExtensionShowcase', () => {
  it('shows the first feature message by default', () => {
    render(<ExtensionShowcase />);

    const [first] = defaultExtensionShowcaseFeatures;
    expect(screen.getByText(first.description)).toBeInTheDocument();
  });

  it('keeps the heading static and swaps the message on selection', () => {
    const onFeatureChange = jest.fn();
    render(
      <ExtensionShowcase
        title="Static title"
        onFeatureChange={onFeatureChange}
      />,
    );

    const target = defaultExtensionShowcaseFeatures[2];
    const [button] = screen.getAllByRole('button', { name: target.label });
    fireEvent.click(button);

    expect(onFeatureChange).toHaveBeenCalledWith(target.id);
    expect(
      screen.getByRole('heading', { name: 'Static title' }),
    ).toBeInTheDocument();
    expect(screen.getByText(target.description)).toBeInTheDocument();
  });

  it('shows the active feature CTA and updates it when switching', () => {
    render(<ExtensionShowcase />);

    const [first] = defaultExtensionShowcaseFeatures;
    expect(screen.getByRole('link', { name: first.cta })).toBeInTheDocument();

    const target = defaultExtensionShowcaseFeatures[2];
    const [button] = screen.getAllByRole('button', { name: target.label });
    fireEvent.click(button);

    expect(screen.getByRole('link', { name: target.cta })).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: first.cta }),
    ).not.toBeInTheDocument();
  });

  it('falls back to ctaLabel when the feature has no cta', () => {
    render(
      <ExtensionShowcase features={[soloFeature]} ctaLabel="Fallback CTA" />,
    );

    expect(
      screen.getByRole('link', { name: 'Fallback CTA' }),
    ).toBeInTheDocument();
  });

  it('hides the CTA when neither feature cta nor ctaLabel is set', () => {
    render(<ExtensionShowcase features={[soloFeature]} ctaLabel="" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
