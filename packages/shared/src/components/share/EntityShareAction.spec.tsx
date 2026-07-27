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
import type { EntityShareActionProps } from './EntityShareAction';
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

const renderComponent = (
  display?: EntityShareActionProps['display'],
): RenderResult =>
  render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <EntityShareAction
        link={link}
        text={text}
        cid={ReferralCampaignKey.ShareTag}
        event={LogEvent.ShareTag}
        targetId="webdev"
        origin={Origin.TagPage}
        display={display}
      />
    </TestBootProvider>,
  );

const getToast = () =>
  client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY) ?? null;

/** The copy entry inside the share list, not the trigger that opens it. */
const findListCopyEntry = () => screen.findByTestId('social-share-Copy link');

describe('EntityShareAction', () => {
  it('renders the split copy control by default', () => {
    renderComponent();

    expect(screen.getByLabelText('Copy link')).toBeInTheDocument();
    expect(screen.getByLabelText('More share options')).toBeInTheDocument();
  });

  it('renders an unlabelled share trigger in the icon display', () => {
    renderComponent('icon');

    expect(screen.getByLabelText('Share')).toBeInTheDocument();
    expect(screen.queryByLabelText('Copy link')).not.toBeInTheDocument();
  });

  it('copies the link straight from the label and shows the copied toast', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
    await waitFor(() =>
      expect(getToast()?.message).toEqual('✅ Copied link to clipboard'),
    );
    // The label copies on its own — the list only opens from the chevron.
    expect(screen.queryByTestId('social-share-X')).not.toBeInTheDocument();
  });

  it('logs the entity share event with the provider and origin', async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy link'));
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

  it('opens the share list from the chevron', async () => {
    renderComponent();

    // Radix's trigger opens on pointerdown/keydown, not click.
    fireEvent.keyDown(screen.getByLabelText('More share options'), {
      key: 'Enter',
    });

    expect(await screen.findByTestId('social-share-X')).toBeInTheDocument();
    expect(await findListCopyEntry()).toBeInTheDocument();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the link from the list entry too', async () => {
    renderComponent();

    fireEvent.keyDown(screen.getByLabelText('More share options'), {
      key: 'Enter',
    });
    await act(async () => {
      fireEvent.click(await findListCopyEntry());
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
  });

  it('opens the native share sheet on a single tap on mobile', async () => {
    useViewSizeMock.mockReturnValue(false);
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share, maxTouchPoints: 2 });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy link'));
    });

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({ text: `${text}\n${link}` }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });
});
