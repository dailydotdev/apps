import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { TextSnapshotButton } from './TextSnapshotButton';

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/downloadShareImage', () => ({
  downloadShareImage: jest.fn(),
}));

const PASSAGE =
  'Every one of them optimised the product they had instead of the one their customers were moving to.';

const logEvent = jest.fn();

const pressSnapshot = () => {
  render(
    <TestBootProvider client={new QueryClient()} log={{ logEvent }}>
      <TextSnapshotButton
        filename="daily-summary"
        origin={Origin.PostSummary}
        post={post}
        text={PASSAGE}
      />
    </TestBootProvider>,
  );
  const button = screen.getByLabelText('Snapshot');
  fireEvent.pointerEnter(button);
  fireEvent.click(button);
};

const loggedShares = () =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.event_name === LogEvent.SharePost)
    .map((event) => JSON.parse(event.extra));

beforeEach(() => {
  logEvent.mockReset();
  jest
    .mocked(captureShareImage)
    .mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
});

describe('snapshot share events', () => {
  it('logs a snapshot share with its placement when it reaches the clipboard', async () => {
    jest.mocked(copyShareImage).mockResolvedValue(true);

    pressSnapshot();

    await waitFor(() =>
      expect(loggedShares()).toEqual([
        {
          provider: ShareProvider.Snapshot,
          origin: Origin.PostSummary,
          result: 'clipboard',
        },
      ]),
    );
  });

  it('records the download fallback, so the clipboard split can be read', async () => {
    jest.mocked(copyShareImage).mockResolvedValue(false);

    pressSnapshot();

    await waitFor(() =>
      expect(loggedShares()).toEqual([
        expect.objectContaining({ result: 'download' }),
      ]),
    );
    expect(downloadShareImage).toHaveBeenCalled();
  });

  it('still logs a press whose capture failed, so failures are countable', async () => {
    jest.mocked(captureShareImage).mockRejectedValue(new Error('tainted'));
    jest.mocked(copyShareImage).mockImplementation(async (blob) => {
      await blob;
      return true;
    });

    pressSnapshot();

    await waitFor(() =>
      expect(loggedShares()).toEqual([
        expect.objectContaining({ result: 'error' }),
      ]),
    );
  });
});
