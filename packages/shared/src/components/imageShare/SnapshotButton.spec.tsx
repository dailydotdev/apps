import React, { createRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { LogEvent, Origin } from '../../lib/log';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { SnapshotButton } from './SnapshotButton';

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

const renderButton = ({
  isLoggedIn = true,
  withPost = true,
}: {
  isLoggedIn?: boolean;
  withPost?: boolean;
} = {}) =>
  render(
    <TestBootProvider auth={{ isLoggedIn }} client={client} log={{ logEvent }}>
      <SnapshotButton
        origin={Origin.PostSummary}
        post={withPost ? post : undefined}
        onResult={onResult}
        target={createRef<HTMLDivElement>()}
      />
    </TestBootProvider>,
  );

const press = () => fireEvent.click(screen.getByLabelText('Snapshot'));

beforeEach(() => {
  jest.clearAllMocks();
  client.clear();
  URL.createObjectURL = jest.fn().mockReturnValue('blob:snapshot');
  URL.revokeObjectURL = jest.fn();
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

  it('only confirms the copy for a snapshot without a post', async () => {
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
