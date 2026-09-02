import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SnapshotButton } from './SnapshotButton';

const mockCapture = jest.fn();
const mockCopy = jest.fn();
const mockDownload = jest.fn();
const mockDisplayToast = jest.fn();

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: (...args: unknown[]) => mockCapture(...args),
}));

jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: (...args: unknown[]) => mockCopy(...args),
}));

jest.mock('../../lib/imageShare/downloadShareImage', () => ({
  downloadShareImage: (...args: unknown[]) => mockDownload(...args),
}));

jest.mock('../../features/snapshot/shutterSound', () => ({
  playShutterSound: jest.fn(),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
  ToastType: { Success: 'success', Error: 'error' },
}));

jest.mock('../../hooks/useRequestProtocol', () => ({
  useRequestProtocol: () => ({ isCompanion: false }),
}));

const blob = new Blob(['png'], { type: 'image/png' });

const renderComponent = (props = {}) => {
  const target = document.createElement('div');

  return render(
    <SnapshotButton filename="daily-snapshot" target={target} {...props} />,
  );
};

const clickSnapshot = () =>
  fireEvent.click(screen.getByLabelText('Snapshot'), {
    preventDefault: jest.fn(),
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockCapture.mockResolvedValue(blob);
});

it('copies the image and says so', async () => {
  mockCopy.mockResolvedValue(true);
  renderComponent();

  clickSnapshot();

  await waitFor(() =>
    expect(mockDisplayToast).toHaveBeenCalledWith('Image copied', {
      variant: 'success',
    }),
  );
  expect(mockDownload).not.toHaveBeenCalled();
});

it('falls back to a download when the clipboard is unavailable', async () => {
  mockCopy.mockResolvedValue(false);
  renderComponent({ filename: 'daily-profile-tomer' });

  clickSnapshot();

  await waitFor(() =>
    expect(mockDownload).toHaveBeenCalledWith(blob, 'daily-profile-tomer'),
  );
  expect(mockDisplayToast).toHaveBeenCalledWith('Image saved', {
    variant: 'success',
  });
});

it('reports a failed capture instead of copying or downloading', async () => {
  mockCapture.mockRejectedValue(new Error('target element has no size'));
  mockCopy.mockResolvedValue(false);
  renderComponent();

  clickSnapshot();

  await waitFor(() =>
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Could not create the snapshot, please try again',
      { variant: 'error' },
    ),
  );
  expect(mockDownload).not.toHaveBeenCalled();
});

it('hands the blob to onCapture instead of sharing it', async () => {
  const onCapture = jest.fn();
  mockCopy.mockResolvedValue(true);
  renderComponent({ onCapture });

  clickSnapshot();

  await waitFor(() => expect(onCapture).toHaveBeenCalledWith(blob));
  expect(mockCopy).not.toHaveBeenCalled();
  expect(mockDownload).not.toHaveBeenCalled();
  expect(mockDisplayToast).not.toHaveBeenCalled();
});
