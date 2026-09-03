import React from 'react';
import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { useShareOrCopyLink } from './useShareOrCopyLink';
import { ReferralCampaignKey } from '../lib/referral';
import * as func from '../lib/func';

const link = 'https://app.daily.dev/posts/abc';
const text = 'Check this out';

const share = jest.fn().mockResolvedValue(undefined);
const writeText = jest.fn().mockResolvedValue(undefined);

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestBootProvider client={new QueryClient()}>{children}</TestBootProvider>
);

const renderShare = () =>
  renderHook(
    () =>
      useShareOrCopyLink({ link, text, cid: ReferralCampaignKey.SharePost }),
    { wrapper },
  );

beforeEach(() => {
  jest.restoreAllMocks();
  share.mockClear();
  writeText.mockClear();
  Object.assign(navigator, { share, clipboard: { writeText } });
});

describe('useShareOrCopyLink', () => {
  it('shares a text and url payload without waiting on the shortener', async () => {
    // navigator.share needs the user activation the press carried, and a
    // round trip spends it — so the URL has to be built synchronously.
    jest.spyOn(func, 'shouldUseNativeShare').mockReturnValue(true);

    const { result } = renderShare();

    await act(async () => {
      await result.current[1]();
    });

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const [payload] = share.mock.calls[0];
    expect(payload.text).toBe(text);
    expect(payload.url).toContain(link);
    expect(payload).not.toHaveProperty('title');
  });

  it('keeps the shortened link on the copy path', async () => {
    jest.spyOn(func, 'shouldUseNativeShare').mockReturnValue(false);

    const { result } = renderShare();

    await act(async () => {
      await result.current[1]();
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(share).not.toHaveBeenCalled();
  });
});
