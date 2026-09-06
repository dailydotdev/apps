import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnapshotButton } from './SnapshotButton';
import * as captureModule from '../../lib/imageShare/captureShareImage';
import * as copyModule from '../../lib/imageShare/copyShareImage';
import * as downloadModule from '../../lib/imageShare/downloadShareImage';
import * as shutterModule from '../../features/snapshot/shutterSound';
import { TOAST_NOTIF_KEY } from '../../hooks/useToastNotification';

const blob = new Blob(['png'], { type: 'image/png' });

let client: QueryClient;

const renderButton = (
  props: Partial<React.ComponentProps<typeof SnapshotButton>> = {},
) => {
  client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <SnapshotButton target={document.createElement('div')} {...props} />
    </QueryClientProvider>,
  );
};

const expectToast = (message: string) =>
  waitFor(() =>
    expect(client.getQueryData(TOAST_NOTIF_KEY)).toMatchObject({ message }),
  );

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(shutterModule, 'playShutterSound').mockImplementation();
  jest
    .spyOn(captureModule, 'captureShareImage')
    .mockResolvedValue(blob as never);
});

it('should copy the image and report it', async () => {
  const copy = jest.spyOn(copyModule, 'copyShareImage').mockResolvedValue(true);
  const download = jest
    .spyOn(downloadModule, 'downloadShareImage')
    .mockImplementation();

  renderButton();
  fireEvent.click(await screen.findByLabelText('Snapshot'));

  await waitFor(() => expect(copy).toHaveBeenCalled());
  await expectToast('Image copied');
  expect(download).not.toHaveBeenCalled();
});

it('should download when the clipboard refuses the image', async () => {
  jest.spyOn(copyModule, 'copyShareImage').mockResolvedValue(false);
  const download = jest
    .spyOn(downloadModule, 'downloadShareImage')
    .mockImplementation();

  renderButton({ filename: 'hot-take' });
  fireEvent.click(await screen.findByLabelText('Snapshot'));

  await waitFor(() => expect(download).toHaveBeenCalledWith(blob, 'hot-take'));
  await expectToast('Image saved');
});

it('should report a failed capture rather than throwing', async () => {
  jest
    .spyOn(captureModule, 'captureShareImage')
    .mockRejectedValue(new Error('no canvas'));

  renderButton();
  fireEvent.click(await screen.findByLabelText('Snapshot'));

  await expectToast('Could not create the snapshot, please try again');
});

it('should say both halves were copied when a link is passed', async () => {
  jest.spyOn(copyModule, 'copyShareImage').mockResolvedValue(true);

  renderButton({ link: () => Promise.resolve('https://daily.dev/p/1') });
  fireEvent.click(await screen.findByLabelText('Snapshot'));

  await expectToast('Image and link copied');
});
