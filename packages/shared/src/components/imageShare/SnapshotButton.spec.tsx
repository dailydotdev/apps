import React, { createRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { downloadShareImage } from '../../lib/imageShare/downloadShareImage';
import { LogEvent, Origin } from '../../lib/log';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';
import { TextSnapshotButton } from '../../features/snapshot/TextSnapshotButton';
import { SnapshotButton } from './SnapshotButton';

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/downloadShareImage', () => ({
  downloadShareImage: jest.fn(),
}));

class FakeClipboardItem {
  public readonly types: string[];

  constructor(public readonly items: Record<string, Blob | Promise<Blob>>) {
    this.types = Object.keys(items);
  }
}

const write = jest.fn();
const logEvent = jest.fn();
const onResult = jest.fn();
const client = new QueryClient();
const image = new Blob(['png'], { type: 'image/png' });

const renderButton = () =>
  render(
    <TestBootProvider client={client}>
      <SnapshotButton
        filename="daily-test"
        onResult={onResult}
        target={createRef<HTMLDivElement>()}
      />
    </TestBootProvider>,
  );

const press = () => {
  const button = screen.getByRole('button', { name: 'Snapshot' });
  fireEvent.pointerDown(button);
  fireEvent.click(button);
};

beforeEach(() => {
  jest.clearAllMocks();
  client.clear();
  write.mockResolvedValue(undefined);
  Object.assign(globalThis, { ClipboardItem: FakeClipboardItem });
  Object.assign(navigator, { clipboard: { write } });
  jest.mocked(captureShareImage).mockResolvedValue(image);
});

describe('SnapshotButton', () => {
  it.each([true, false])(
    'copies a post snapshot without opening share options (logged in: %s)',
    async (isLoggedIn) => {
      render(
        <TestBootProvider
          auth={{ isLoggedIn }}
          client={client}
          log={{ logEvent }}
        >
          <TextSnapshotButton
            filename={`daily-tldr-${post.id}`}
            origin={Origin.PostSummary}
            post={post}
            text="A summary to capture"
          />
        </TestBootProvider>,
      );

      press();

      await waitFor(() =>
        expect(logEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            event_name: LogEvent.SharePost,
          }),
        ),
      );
      expect(JSON.parse(logEvent.mock.calls[0][0].extra)).toMatchObject({
        result: 'clipboard',
      });
      expect(write).toHaveBeenCalledTimes(1);
      const [[[item]]] = write.mock.calls;
      expect(item.types).toEqual(['image/png']);
      await expect(item.items['image/png']).resolves.toBe(image);
      expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
        message: 'Image copied',
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Paste it anywhere, or send it:'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Copy link' }),
      ).not.toBeInTheDocument();
      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: LogEvent.OpenSnapshotSharePanel,
        }),
      );
      expect(downloadShareImage).not.toHaveBeenCalled();
    },
  );

  it('falls back to saving the image when clipboard access is denied', async () => {
    write.mockRejectedValue(new Error('NotAllowedError'));
    renderButton();

    press();

    await waitFor(() => expect(onResult).toHaveBeenCalledWith('download'));
    expect(downloadShareImage).toHaveBeenCalledWith(image, 'daily-test');
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: 'Image saved',
    });
  });

  it('reports a failed capture without opening share options', async () => {
    jest
      .mocked(captureShareImage)
      .mockRejectedValue(new Error('Capture failed'));
    Object.assign(navigator, { clipboard: {} });
    renderButton();

    press();

    await waitFor(() => expect(onResult).toHaveBeenCalledWith('error'));
    expect(downloadShareImage).not.toHaveBeenCalled();
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({
      message: 'Could not create the snapshot, please try again',
    });
  });
});
