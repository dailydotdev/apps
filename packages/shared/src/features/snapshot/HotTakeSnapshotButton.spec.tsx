import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import type { HotTake } from '../../graphql/user/userHotTake';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { HotTakeSnapshotButton } from './HotTakeSnapshotButton';

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: jest.fn(),
}));

const hotTake: HotTake = {
  id: 'take-1',
  emoji: '🔥',
  title: 'Tabs won',
  subtitle: 'Prettier just hid the bodies',
  position: 0,
  createdAt: '2026-09-01T00:00:00.000Z',
  upvotes: 12,
};

const logEvent = jest.fn();

const renderButton = () =>
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <HotTakeSnapshotButton hotTake={hotTake} origin={Origin.HotTakeList} />
    </TestBootProvider>,
  );

const cardCopies = () =>
  screen.queryAllByText('Tabs won Prettier just hid the bodies').length;

beforeEach(() => {
  logEvent.mockReset();
  jest
    .mocked(captureShareImage)
    .mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  jest.mocked(copyShareImage).mockResolvedValue(true);
});

describe('HotTakeSnapshotButton', () => {
  it('keeps the card out of the page until the reader reaches for it', () => {
    renderButton();

    // Every take in a profile list carries a button, and each card is 1080px.
    expect(cardCopies()).toBe(0);

    fireEvent.pointerEnter(screen.getByLabelText('Snapshot'));

    expect(cardCopies()).toBe(1);
  });

  it('logs the snapshot as a hot take share with its placement', async () => {
    renderButton();
    const button = screen.getByLabelText('Snapshot');
    fireEvent.pointerEnter(button);
    fireEvent.click(button);

    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ShareHotTake,
        target_id: hotTake.id,
        extra: JSON.stringify({
          provider: ShareProvider.Snapshot,
          origin: Origin.HotTakeList,
          result: 'clipboard',
        }),
      }),
    );
  });
});
