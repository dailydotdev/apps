import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SnapshotButton } from './SnapshotButton';

const mockCapture = jest.fn();
const mockCopy = jest.fn();
const mockDownload = jest.fn();
const mockDisplayToast = jest.fn();

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: (...args: unknown[]) => mockCapture(...args),
  SHARE_IMAGE_WIDTH: 1200,
  SHARE_IMAGE_HEIGHT: 630,
}));

jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: (...args: unknown[]) => mockCopy(...args),
}));

jest.mock('../../lib/imageShare/downloadShareImage', () => ({
  downloadShareImage: (...args: unknown[]) => mockDownload(...args),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
  ToastType: { Success: 'success', Error: 'error' },
}));

jest.mock('../../features/snapshot/shutterSound', () => ({
  playShutterSound: jest.fn(),
}));

jest.mock('../../hooks/useRequestProtocol', () => ({
  useRequestProtocol: () => ({ isCompanion: false }),
}));

const blob = new Blob(['png'], { type: 'image/png' });
const card = <div>a designed card</div>;

beforeEach(() => {
  jest.clearAllMocks();
  mockCapture.mockResolvedValue(blob);
  mockCopy.mockResolvedValue(true);
  // jsdom has neither, and the hook probes both before it will offer a copy.
  Object.assign(URL, {
    createObjectURL: () => 'blob:preview',
    revokeObjectURL: () => undefined,
  });
  Object.assign(globalThis, { ClipboardItem: class {} });
  Object.assign(navigator, { clipboard: { write: async () => undefined } });
});

const button = () => screen.getByLabelText('Snapshot');

it('does not rasterize the card until there is intent', () => {
  render(<SnapshotButton card={card} filename="daily-share" />);

  expect(mockCapture).not.toHaveBeenCalled();
});

it('rasterizes on hover, so the press still owns the gesture', async () => {
  render(<SnapshotButton card={card} filename="daily-share" />);

  fireEvent.pointerEnter(button());

  await waitFor(() => expect(mockCapture).toHaveBeenCalledTimes(1));
});

it('rasterizes on keyboard focus too', async () => {
  render(<SnapshotButton card={card} filename="daily-share" />);

  fireEvent.focus(button());

  await waitFor(() => expect(mockCapture).toHaveBeenCalledTimes(1));
});

it('copies the rendered card and says so', async () => {
  render(<SnapshotButton card={card} filename="daily-share" />);

  fireEvent.pointerEnter(button());
  await waitFor(() => expect(mockCapture).toHaveBeenCalled());
  fireEvent.click(button());

  await waitFor(() =>
    expect(mockDisplayToast).toHaveBeenCalledWith('Image copied', {
      variant: 'success',
    }),
  );
  expect(mockDownload).not.toHaveBeenCalled();
});

it('downloads when the clipboard cannot take an image', async () => {
  mockCopy.mockResolvedValue(false);
  render(<SnapshotButton card={card} filename="daily-achievement-1" />);

  fireEvent.pointerEnter(button());
  await waitFor(() => expect(mockCapture).toHaveBeenCalled());
  fireEvent.click(button());

  await waitFor(() =>
    expect(mockDownload).toHaveBeenCalledWith(blob, 'daily-achievement-1'),
  );
  expect(mockDisplayToast).toHaveBeenCalledWith('Image saved', {
    variant: 'success',
  });
});

it('reports a failed rasterization instead of going quiet', async () => {
  mockCapture.mockRejectedValue(new Error('target element has no size'));
  render(<SnapshotButton card={card} filename="daily-share" />);

  fireEvent.click(button());

  await waitFor(() =>
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Could not create the snapshot, please try again',
      { variant: 'error' },
    ),
  );
  expect(mockCopy).not.toHaveBeenCalled();
  expect(mockDownload).not.toHaveBeenCalled();
});

it('refuses to render without a card or a target', () => {
  // eslint-disable-next-line no-console
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => render(<SnapshotButton filename="daily-share" />)).toThrow(
    'SnapshotButton needs either a card or a target',
  );

  error.mockRestore();
});
