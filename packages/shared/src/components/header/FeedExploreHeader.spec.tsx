import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { ExploreTabs, FeedExploreHeader } from './FeedExploreHeader';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

const mockDisplayToast = jest.fn();
jest.mock('../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../hooks/useToastNotification'),
  useToastNotification: () => ({
    displayToast: mockDisplayToast,
    dismissToast: jest.fn(),
  }),
}));

const logEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

const gbWithFeatures = (features: Record<string, boolean>): GrowthBook =>
  new GrowthBook({
    features: Object.fromEntries(
      Object.entries(features).map(([id, value]) => [
        id,
        { defaultValue: value },
      ]),
    ),
  });

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText } });
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/posts/upvoted',
        asPath: '/posts/upvoted',
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
      } as unknown as NextRouter),
  );
});

const renderComponent = (gb?: GrowthBook): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client} gb={gb} log={{ logEvent }}>
      <FeedExploreHeader tab={ExploreTabs.MostUpvoted} setTab={jest.fn()} />
    </TestBootProvider>,
  );
};

describe('FeedExploreHeader share affordance flag-off', () => {
  it('renders no share control and keeps the original right-side span', () => {
    renderComponent();

    expect(screen.queryByLabelText('Share this feed')).not.toBeInTheDocument();
    // The period dropdown trigger is the only button; its wrapper span must
    // keep the pre-initiative class list so flag-off DOM stays identical.
    const dropdownTrigger = screen.getByRole('button');
    expect(dropdownTrigger.closest('span')?.className).toBe('ml-auto');
  });

  it('renders no share control when only the master flag is on', () => {
    renderComponent(gbWithFeatures({ sharing_visibility: true }));

    expect(screen.queryByLabelText('Share this feed')).not.toBeInTheDocument();
  });

  it('renders no share control when only share_discovery is on', () => {
    renderComponent(gbWithFeatures({ share_discovery: true }));

    expect(screen.queryByLabelText('Share this feed')).not.toBeInTheDocument();
  });
});

describe('FeedExploreHeader share affordance flag-on', () => {
  const gb = gbWithFeatures({
    sharing_visibility: true,
    share_discovery: true,
  });

  it('renders exactly one copy-link control', () => {
    renderComponent(gb);

    expect(screen.getAllByLabelText('Share this feed')).toHaveLength(1);
  });

  it('copies the canonical explore url, toasts and logs on tap', async () => {
    renderComponent(gb);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share this feed'));
    });

    // webappUrl is '/' under Jest, so the canonical link is the bare path
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('/posts/upvoted'),
    );
    expect(mockDisplayToast).toHaveBeenCalledWith(
      '✅ Copied link to clipboard',
      expect.anything(),
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ShareLog,
      target_id: '/posts/upvoted',
      extra: JSON.stringify({
        origin: Origin.ExploreFeed,
        provider: ShareProvider.CopyLink,
      }),
    });
  });

  it('uses the native share sheet on mobile', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 2,
      configurable: true,
    });

    renderComponent(gb);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share this feed'));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: expect.stringContaining('/posts/upvoted'),
      }),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ShareLog,
        extra: JSON.stringify({
          origin: Origin.ExploreFeed,
          provider: ShareProvider.Native,
        }),
      }),
    );

    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });
    delete (navigator as { share?: unknown }).share;
  });
});
