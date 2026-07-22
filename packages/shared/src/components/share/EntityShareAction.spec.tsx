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
import { EntityShareAction } from './EntityShareAction';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';
import type { ToastNotification } from '../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { useViewSize } from '../../hooks/useViewSize';

jest.mock('../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
const link = 'https://daily.dev/tags/webdev';
const text = 'Check out the webdev tag on daily.dev';

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient();
  useViewSizeMock.mockReturnValue(true); // default: laptop
  Object.assign(navigator, { clipboard: { writeText }, maxTouchPoints: 0 });
});

const renderComponent = (): RenderResult =>
  render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <EntityShareAction
        link={link}
        text={text}
        cid={ReferralCampaignKey.ShareTag}
        event={LogEvent.ShareTag}
        targetId="webdev"
        origin={Origin.TagPage}
      />
    </TestBootProvider>,
  );

const getToast = () =>
  client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY) ?? null;

describe('EntityShareAction', () => {
  it('renders a labelled share trigger separate from the follow controls', () => {
    renderComponent();

    expect(screen.getByLabelText('Share')).toBeInTheDocument();
  });

  it('copies the link and shows the copied toast', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share'));
    });
    await act(async () => {
      fireEvent.click(await screen.findByText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
    await waitFor(() =>
      expect(getToast()?.message).toEqual('✅ Copied link to clipboard'),
    );
  });

  it('logs the entity share event with the provider and origin', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share'));
    });
    await act(async () => {
      fireEvent.click(await screen.findByText('Copy link'));
    });

    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ShareTag,
        target_id: 'webdev',
        extra: JSON.stringify({
          provider: ShareProvider.CopyLink,
          origin: Origin.TagPage,
        }),
      }),
    );
  });

  it('opens the native share sheet on a single tap on mobile', async () => {
    useViewSizeMock.mockReturnValue(false);
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, maxTouchPoints: 2 });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share'));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({ text: `${text}\n${link}` }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });
});
