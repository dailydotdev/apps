import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ExtensionShowcase } from './ExtensionShowcase';
import { defaultExtensionShowcaseFeatures } from './defaultFeatures';

const featureById = (id: string) =>
  defaultExtensionShowcaseFeatures.find((feature) => feature.id === id)!;

const scrollIntoView = jest.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
});

describe('ExtensionShowcase', () => {
  it('opens on the new tab feed', () => {
    render(<ExtensionShowcase />);

    expect(screen.getByRole('tab', { name: 'New tab feed' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText(featureById('newtab').description)).toBeVisible();
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('New tab feed');
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

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'auto', inline: 'center' }),
    );

    await act(async () => fontsReady());

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Companion' }));

    expect(scrollIntoView).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'smooth' }),
    );
  });

  it('glides without animation when the user prefers reduced motion', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });
    render(<ExtensionShowcase />);

    fireEvent.click(screen.getByRole('tab', { name: 'Companion' }));

    expect(scrollIntoView).toHaveBeenLastCalledWith(
      expect.objectContaining({ behavior: 'auto' }),
    );
  });

  it('swaps the caption and illustration on selection', () => {
    const onFeatureChange = jest.fn();
    render(<ExtensionShowcase onFeatureChange={onFeatureChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Companion' }));

    const companion = featureById('companion');
    expect(onFeatureChange).toHaveBeenCalledWith('companion');
    expect(screen.getByText(companion.description)).toBeVisible();
    expect(screen.getByAltText(companion.media.alt)).toBeVisible();
    expect(
      screen.queryByText(featureById('newtab').description),
    ).not.toBeInTheDocument();
  });

  it('moves the selection with the arrow, Home and End keys', () => {
    render(<ExtensionShowcase />);
    const selected = () => screen.getByRole('tab', { selected: true });

    fireEvent.keyDown(selected(), { key: 'ArrowRight' });
    expect(selected()).toHaveTextContent('Companion');
    expect(selected()).toHaveFocus();

    fireEvent.keyDown(selected(), { key: 'ArrowLeft' });
    fireEvent.keyDown(selected(), { key: 'ArrowLeft' });
    expect(selected()).toHaveTextContent('Shortcuts');

    fireEvent.keyDown(selected(), { key: 'End' });
    expect(selected()).toHaveTextContent('Focus mode');

    fireEvent.keyDown(selected(), { key: 'ArrowRight' });
    expect(selected()).toHaveTextContent('Read it here');

    fireEvent.keyDown(selected(), { key: 'Home' });
    expect(selected()).toHaveTextContent('Read it here');
  });

  it('warms up every illustration on mount', () => {
    const sources: string[] = [];
    jest.spyOn(window, 'Image').mockImplementation(
      () =>
        ({
          set src(value: string) {
            sources.push(value);
          },
        } as HTMLImageElement),
    );
    render(<ExtensionShowcase />);

    expect(sources).toEqual(
      defaultExtensionShowcaseFeatures
        .filter((feature) => feature.media.type === 'image')
        .map((feature) => feature.media.src),
    );
  });
});
