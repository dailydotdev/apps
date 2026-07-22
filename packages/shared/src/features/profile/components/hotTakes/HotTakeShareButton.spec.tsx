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
import { HotTakeShareButton } from './HotTakeShareButton';
import { getHotTakeShareText, getHotTakesProfileUrl } from './common';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import loggedUser from '../../../../../__tests__/fixture/loggedUser';
import { useHotTakeShareEnabled } from '../../../../hooks/useHotTakeShareEnabled';
import { useViewSize } from '../../../../hooks/useViewSize';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { getShortLinkProps } from '../../../../hooks/utils/useGetShortUrl';
import { ReferralCampaignKey } from '../../../../lib/referral';
import { LogEvent, Origin } from '../../../../lib/log';
import { ShareProvider } from '../../../../lib/share';

// `NEXT_PUBLIC_WEBAPP_URL` is '/' under jest, but the referral tracker builds a
// `new URL(...)` and needs the absolute origin production actually ships.
jest.mock('../../../../lib/constants', () => ({
  ...jest.requireActual('../../../../lib/constants'),
  webappUrl: 'https://app.daily.dev/',
}));

jest.mock('../../../../hooks/useHotTakeShareEnabled', () => ({
  useHotTakeShareEnabled: jest.fn(),
}));

jest.mock('../../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

jest.mock('../../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../../hooks/useToastNotification'),
  useToastNotification: jest.fn(),
}));

const shareEnabledMock = useHotTakeShareEnabled as jest.Mock;
const viewSizeMock = useViewSize as jest.Mock;
const toastMock = useToastNotification as jest.Mock;
const displayToast = jest.fn();
const logEvent = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

const link = getHotTakesProfileUrl('spicydev');
const text = getHotTakeShareText({
  title: 'Small PRs or bust',
  username: 'spicydev',
});
const shortLink = 'https://dly.to/take';

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  shareEnabledMock.mockReturnValue(true);
  viewSizeMock.mockReturnValue(true); // laptop
  toastMock.mockReturnValue({ displayToast, dismissToast: jest.fn() });
  Object.assign(navigator, { clipboard: { writeText } });
  // Not mobile by default: no native share detection.
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 0,
    configurable: true,
  });
  delete (navigator as { share?: unknown }).share;

  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { queryKey } = getShortLinkProps(
    link,
    ReferralCampaignKey.Generic,
    loggedUser,
  );
  client.setQueryData(queryKey, shortLink);
});

const renderButton = (): RenderResult =>
  render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <HotTakeShareButton
        link={link}
        text={text}
        label='Share "Small PRs or bust"'
        targetId="take-1"
        origin={Origin.HotTakeList}
      />
    </TestBootProvider>,
  );

describe('HotTakeShareButton', () => {
  it('builds a deep link to the hot-takes section of the owner profile', () => {
    expect(link).toBe('https://app.daily.dev/spicydev#hot-takes');
    expect(text).toBe('Hot take: "Small PRs or bust" — @spicydev on daily.dev');
  });

  it('copies the deep link, shows the toast and logs one ShareLog event', async () => {
    renderButton();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share "Small PRs or bust"'));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(shortLink));
    expect(displayToast).toHaveBeenCalledWith(
      '✅ Copied link to clipboard',
      expect.anything(),
    );
    expect(logEvent).toHaveBeenCalledTimes(1);
    const [payload] = logEvent.mock.calls[0];
    expect(payload).toMatchObject({
      event_name: LogEvent.ShareLog,
      target_id: 'take-1',
    });
    expect(JSON.parse(payload.extra)).toEqual({
      provider: ShareProvider.CopyLink,
      origin: Origin.HotTakeList,
    });
  });

  it('opens the native share sheet on a single mobile tap', async () => {
    viewSizeMock.mockReturnValue(false); // mobile viewport
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 2,
      configurable: true,
    });
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });

    renderButton();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share "Small PRs or bust"'));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({ text: `${text}\n${shortLink}` }),
    );
    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(JSON.parse(logEvent.mock.calls[0][0].extra)).toMatchObject({
      provider: ShareProvider.Native,
      origin: Origin.HotTakeList,
    });
  });

  it('renders nothing when the flag is off', () => {
    shareEnabledMock.mockReturnValue(false);
    const { container } = renderButton();

    expect(container).toBeEmptyDOMElement();
  });
});
