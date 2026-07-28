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
import { ShareStreakButton, getStreakShareText } from './ShareStreakButton';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { ToastNotification } from '../../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';

const link = 'https://app.daily.dev/idoshamun';
const writeText = jest.fn().mockResolvedValue(undefined);
const share = jest.fn().mockResolvedValue(undefined);
const canShare = jest.fn();
// `shouldUseNativeShare` gates on `isMobile()`, which reads this flag.
const setMobile = () => {
  globalThis.localStorage.mobile = 'true';
};

beforeEach(() => {
  jest.clearAllMocks();
  delete globalThis.localStorage.mobile;
  Object.assign(globalThis.navigator, { clipboard: { writeText } });
  delete (globalThis.navigator as { share?: unknown }).share;
  delete (globalThis.navigator as { canShare?: unknown }).canShare;
});

let client: QueryClient;

const renderComponent = (
  props: Partial<Parameters<typeof ShareStreakButton>[0]> = {},
): RenderResult => {
  client = new QueryClient();

  return render(
    <TestBootProvider client={client}>
      <ShareStreakButton currentStreak={12} link={link} {...props} />
    </TestBootProvider>,
  );
};

const clickShare = async () => {
  await act(async () => {
    fireEvent.click(screen.getByLabelText('Share streak'));
  });
};

describe('getStreakShareText', () => {
  it('sounds like a developer and carries the streak length', () => {
    expect(getStreakShareText(3)).toBe(
      '3-day reading streak on daily.dev and counting.',
    );
    expect(getStreakShareText(45)).toContain('45 days straight');
    expect(getStreakShareText(120)).toContain('120 days without breaking');
  });
});

describe('ShareStreakButton on desktop', () => {
  it('copies the link to the clipboard and shows a toast', async () => {
    renderComponent();

    await clickShare();

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link));
    await waitFor(() =>
      expect(
        client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY)?.message,
      ).toEqual('✅ Copied link to clipboard'),
    );
  });
});

describe('ShareStreakButton on mobile', () => {
  beforeEach(setMobile);

  it('opens the native share sheet with the streak text and link', async () => {
    Object.assign(globalThis.navigator, { share });

    renderComponent();
    await clickShare();

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share).toHaveBeenCalledWith({
      text: `${getStreakShareText(12)}\n${link}`,
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('attaches the streak image when the platform can share files', async () => {
    Object.assign(globalThis.navigator, { share, canShare });
    canShare.mockReturnValue(true);
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    });

    renderComponent({ imageUrl: 'https://media.daily.dev/streak.png' });
    await clickShare();

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const [payload] = share.mock.calls[0];
    expect(payload.files).toHaveLength(1);
    expect(payload.files[0].type).toBe('image/png');
  });

  it('falls back to link + text when file sharing is unsupported', async () => {
    Object.assign(globalThis.navigator, { share, canShare });
    canShare.mockReturnValue(false);
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    });

    renderComponent({ imageUrl: 'https://media.daily.dev/streak.png' });
    await clickShare();

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share).toHaveBeenCalledWith({
      text: `${getStreakShareText(12)}\n${link}`,
    });
  });

  it('falls back to link + text when navigator.canShare is missing', async () => {
    Object.assign(globalThis.navigator, { share });
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    });

    renderComponent({ imageUrl: 'https://media.daily.dev/streak.png' });
    await clickShare();

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share).toHaveBeenCalledWith({
      text: `${getStreakShareText(12)}\n${link}`,
    });
  });
});
