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
import { SquadDirectoryShareButton } from './SquadDirectoryShareButton';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { getShortLinkProps } from '../../../hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../../lib/referral';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';
import { useViewSize } from '../../../hooks/useViewSize';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { ShareProvider } from '../../../lib/share';

jest.mock('../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
const squad = generateTestSquad();
const shortLink = 'https://dly.to/squad';

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  useViewSizeMock.mockReturnValue(true); // default: laptop
  Object.assign(navigator, { clipboard: { writeText } });

  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Seed the resolved short URL so the copy path never hits the network.
  const { queryKey } = getShortLinkProps(
    squad.permalink,
    ReferralCampaignKey.ShareSource,
    loggedUser,
  );
  client.setQueryData(queryKey, shortLink);
});

afterEach(() => {
  delete (navigator as { share?: unknown }).share;
});

const renderComponent = (): RenderResult =>
  render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <SquadDirectoryShareButton squad={squad} />
    </TestBootProvider>,
  );

const expectedLog = (provider: ShareProvider) => ({
  event_name: LogEvent.ShareSource,
  target_type: TargetType.Source,
  target_id: squad.id,
  extra: JSON.stringify({ origin: Origin.SquadDirectory, provider }),
});

describe('SquadDirectoryShareButton on desktop', () => {
  it('copies the squad permalink, shows a toast and logs a source share', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share Squad'));
    });

    await act(async () => {
      fireEvent.click(await screen.findByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(shortLink));
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: '✅ Copied link to clipboard',
    });
    expect(logEvent).toHaveBeenCalledWith(expectedLog(ShareProvider.CopyLink));
  });
});

describe('SquadDirectoryShareButton on mobile', () => {
  beforeEach(() => {
    useViewSizeMock.mockReturnValue(false);
  });

  it('opens the native share sheet on a single tap when available', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });
    // `shouldUseNativeShare` also requires a touch device.
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 5,
    });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share Squad'));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        text: `Check out ${squad.handle} on daily.dev\n${shortLink}`,
      }),
    );
    expect(writeText).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(expectedLog(ShareProvider.Native));
  });

  it('falls back to copying when native share is unavailable', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share Squad'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(shortLink));
    expect(logEvent).toHaveBeenCalledWith(expectedLog(ShareProvider.CopyLink));
  });
});
