import React, { createRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { featureSnapshotShareOptions } from '../../lib/featureManagement';
import { LogEvent, Origin } from '../../lib/log';
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

const renderButton = ({
  shareOptions = true,
  isLoggedIn = true,
}: { shareOptions?: boolean; isLoggedIn?: boolean } = {}) => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureSnapshotShareOptions.id]: { defaultValue: shareOptions },
  });

  return render(
    <TestBootProvider
      auth={{ isLoggedIn }}
      client={new QueryClient()}
      gb={gb}
      log={{ logEvent }}
    >
      <SnapshotButton
        origin={Origin.PostSummary}
        post={post}
        onResult={onResult}
        target={createRef<HTMLDivElement>()}
      />
    </TestBootProvider>,
  );
};

const press = () => fireEvent.click(screen.getByLabelText('Snapshot'));

beforeEach(() => {
  jest.clearAllMocks();
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

  it('keeps today’s behaviour with the flag off', async () => {
    renderButton({ shareOptions: false });

    press();

    await waitFor(() => expect(onResult).toHaveBeenCalledWith('clipboard'));
    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
  });
});
