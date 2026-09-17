import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExtensionShowcase } from './ExtensionShowcase';
import { defaultExtensionShowcaseFeatures } from './defaultFeatures';

const featureById = (id: string) =>
  defaultExtensionShowcaseFeatures.find((feature) => feature.id === id)!;

beforeEach(() => {
  Element.prototype.scrollTo = jest.fn();
});

describe('ExtensionShowcase', () => {
  it('opens on the new tab feed', () => {
    render(<ExtensionShowcase />);

    expect(
      screen.getByRole('button', { name: 'New tab feed' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(featureById('newtab').description)).toBeVisible();
    expect(
      screen.getByLabelText(featureById('newtab').media.alt),
    ).toBeVisible();
  });

  it('swaps the caption and illustration on selection', () => {
    const onFeatureChange = jest.fn();
    render(<ExtensionShowcase onFeatureChange={onFeatureChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Companion' }));

    const companion = featureById('companion');
    expect(onFeatureChange).toHaveBeenCalledWith('companion');
    expect(screen.getByText(companion.description)).toBeVisible();
    expect(screen.getByAltText(companion.media.alt)).toBeVisible();
    expect(
      screen.queryByText(featureById('newtab').description),
    ).not.toBeInTheDocument();
  });
});
