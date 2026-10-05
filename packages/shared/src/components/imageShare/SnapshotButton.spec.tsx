import React, { createRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockObjectUrls } from '../../../__tests__/helpers/objectUrl';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { SnapshotButton } from './SnapshotButton';
import type { SnapshotShare } from './SnapshotSharePanel';

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: jest.fn(),
}));
jest.mock('../../hooks/integrations/slack/useSlackShare', () => ({
  useSlackShare: () => ({ isLoading: false, canPostAsUser: false }),
}));

const logEvent = jest.fn();
const onResult = jest.fn();

const client = new QueryClient();

const profileShare: SnapshotShare = {
  link: 'https://app.daily.dev/ada',
  cid: ReferralCampaignKey.ShareProfile,
  event: LogEvent.ShareProfile,
  targetId: 'ada-id',
  targetType: TargetType.ProfilePage,
};

const renderButton = ({
  isLoggedIn = true,
  withPost = true,
  share,
}: {
  isLoggedIn?: boolean;
  withPost?: boolean;
  share?: SnapshotShare;
} = {}) =>
  render(
    <TestBootProvider auth={{ isLoggedIn }} client={client} log={{ logEvent }}>
      <SnapshotButton
        origin={Origin.PostSummary}
        post={withPost ? post : undefined}
        share={share}
        onResult={onResult}
        target={createRef<HTMLDivElement>()}
      />
    </TestBootProvider>,
  );

const press = () => fireEvent.click(screen.getByLabelText('Snapshot'));

mockObjectUrls();

beforeEach(() => {
  jest.clearAllMocks();
  client.clear();
  jest
    .mocked(captureShareImage)
    .mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  jest.mocked(copyShareImage).mockResolvedValue(true);
});

describe('SnapshotButton share options', () => {
  it('offers where to send the snapshot once it is copied', async () => {
    renderButton();

    press();

    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(screen.getByText('Connect Slack')).toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.OpenSnapshotSharePanel,
        target_id: post.id,
      }),
    );
  });

  it('leaves Slack out for a logged-out reader', async () => {
    renderButton({ isLoggedIn: false });

    press();

    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(screen.queryByText('Connect Slack')).not.toBeInTheDocument();
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('shares a subject other than a post by its own link and target', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
    renderButton({ withPost: false, share: profileShare });

    press();

    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(screen.queryByText('Connect Slack')).not.toBeInTheDocument();
    expect(screen.getByLabelText('X')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.OpenSnapshotSharePanel,
      target_id: 'ada-id',
      target_type: TargetType.ProfilePage,
      extra: JSON.stringify({ placement: Origin.PostSummary }),
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://app.daily.dev/ada',
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ShareProfile,
      target_id: 'ada-id',
      target_type: TargetType.ProfilePage,
      extra: JSON.stringify({
        provider: ShareProvider.CopyLink,
        origin: Origin.SnapshotSharePanel,
        placement: Origin.PostSummary,
      }),
    });
  });

  it('pastes the image into the network composer where files cannot be shared', async () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    renderButton({ withPost: false, share: profileShare });

    press();
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    jest.mocked(copyShareImage).mockClear();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('X'));
    });

    expect(copyShareImage).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(open).toHaveBeenCalledWith('https://x.com/intent/post', '_blank'),
    );
    await waitFor(() =>
      expect(
        client.getQueryData<{ message: string }>(TOAST_NOTIF_KEY)?.message,
      ).toMatch(/Image copied\. Press (⌘V|Ctrl\+V) to add it to your post\./),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.ShareProfile,
        extra: expect.stringContaining('"method":"paste"'),
      }),
    );
    expect(
      screen.getByText(/Image copied\. Press (⌘V|Ctrl\+V) in X to add it\./),
    ).toBeInTheDocument();
    expect(
      client.getQueryData<{ action?: { copy: string } }>(TOAST_NOTIF_KEY)
        ?.action?.copy,
    ).toBe('Open X');
    open.mockRestore();
  });

  it('swaps the snapshot icon for a check once the image is copied', async () => {
    renderButton();

    press();

    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(
      screen
        .getByLabelText('Snapshot')
        .querySelector('.text-accent-avocado-default'),
    ).not.toBeNull();
  });

  it('hands the image file to the share sheet on a phone', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      canShare: () => true,
      share,
      maxTouchPoints: 5,
    });
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    renderButton({ withPost: false, share: profileShare });

    press();
    expect(await screen.findByText('Copied')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('WhatsApp'));
    });

    expect(share).toHaveBeenCalledWith({ files: [expect.any(File)] });
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
    Object.assign(navigator, {
      canShare: undefined,
      share: undefined,
      maxTouchPoints: 0,
    });
  });

  it('pastes into the composer on a desktop that can share files', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      canShare: () => true,
      share,
      maxTouchPoints: 0,
    });
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    renderButton({ withPost: false, share: profileShare });

    press();
    expect(await screen.findByText('Copied')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('LinkedIn'));
    });

    expect(share).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith(
      'https://www.linkedin.com/feed/?shareActive=true',
      '_blank',
    );
    open.mockRestore();
    Object.assign(navigator, { canShare: undefined, share: undefined });
  });

  it('only confirms the copy for a snapshot with nothing to link', async () => {
    renderButton({ withPost: false });

    press();

    await waitFor(() => expect(onResult).toHaveBeenCalledWith('clipboard'));
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: 'Image copied',
    });
    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.OpenSnapshotSharePanel,
      }),
    );
  });
});
