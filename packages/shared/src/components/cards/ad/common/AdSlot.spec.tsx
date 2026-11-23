import React from 'react';
import { createPortal } from 'react-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import ad from '../../../../../__tests__/fixture/ad';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import type { Ad } from '../../../../graphql/posts';
import { AdSlot } from './AdSlot';

afterEach(() => jest.restoreAllMocks());

it('captures native and portaled ad clicks on the existing root and stops for a cached ad when disabled', () => {
  const gb = new GrowthBook({
    features: { ad_slot_lifecycle: { defaultValue: true } },
  });
  const client = new QueryClient();
  const src = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');
  const bubble = jest.fn();
  const creative: Ad = {
    ...ad,
    generationId: 'slot-portaled-clicks',
    lifecycle: {
      version: 1,
      on: { click: [{ type: 'pixel', url: 'https://tracking.example/click' }] },
    },
  };
  const show = () => (
    <TestBootProvider client={client} gb={gb}>
      <AdSlot ad={creative}>
        {(slotProps) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Tests existing delegated click handling.
          <article {...slotProps} data-testid="slot-root" onClick={bubble}>
            <a href={ad.link}>Creative</a>
            <a href="https://daily.dev/advertise">Advertise</a>
            {createPortal(
              <a
                href="https://advertiser.example/resolved-macros"
                data-ad-click
              >
                Menu creative
              </a>,
              document.body,
            )}
          </article>
        )}
      </AdSlot>
    </TestBootProvider>
  );
  const { container, rerender } = render(show());
  const root = screen.getByTestId('slot-root');
  expect(container.firstElementChild).toBe(root);
  fireEvent.click(screen.getByRole('link', { name: 'Advertise' }));
  expect(src).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('link', { name: 'Creative' }));
  fireEvent.click(screen.getByRole('link', { name: 'Menu creative' }));
  fireEvent(
    screen.getByRole('link', { name: 'Menu creative' }),
    new MouseEvent('auxclick', { bubbles: true, button: 1 }),
  );
  expect(src).toHaveBeenCalledTimes(3);
  expect(bubble).toHaveBeenCalledTimes(3);

  act(() => gb.setFeatures({ ad_slot_lifecycle: { defaultValue: false } }));
  rerender(show());
  expect(screen.getByTestId('slot-root')).toBe(root);
  fireEvent.click(screen.getByRole('link', { name: 'Creative' }));
  fireEvent.click(screen.getByRole('link', { name: 'Menu creative' }));
  expect(src).toHaveBeenCalledTimes(3);
  expect(bubble).toHaveBeenCalledTimes(5);
});
