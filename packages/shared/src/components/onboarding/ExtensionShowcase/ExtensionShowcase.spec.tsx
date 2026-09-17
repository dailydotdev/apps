import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ExtensionShowcase } from './ExtensionShowcase';
import { defaultExtensionShowcaseFeatures } from './defaultFeatures';

const featureById = (id: string) =>
  defaultExtensionShowcaseFeatures.find((feature) => feature.id === id)!;

const scrollTo = jest.fn();

beforeEach(() => {
  scrollTo.mockClear();
  Element.prototype.scrollTo = scrollTo;
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

  it('renders nothing without features', () => {
    const { container } = render(<ExtensionShowcase features={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('centers the tab on first paint and again once fonts are ready', async () => {
    let fontsReady: () => void;
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: new Promise<void>((resolve) => {
          fontsReady = resolve;
        }),
      },
    });
    render(<ExtensionShowcase />);

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    );

    await act(async () => fontsReady());

    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Companion' }));

    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
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
