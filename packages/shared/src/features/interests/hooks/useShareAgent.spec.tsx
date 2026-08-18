import { act, renderHook } from '@testing-library/react';
import { agentShareLink, useShareAgent } from './useShareAgent';
import { addLogQueryParams } from '../../../lib/share';
import { ReferralCampaignKey } from '../../../lib/referral';
import * as shareOrCopyLink from '../../../hooks/useShareOrCopyLink';
import type { UserInterest } from '../../../graphql/interests';

describe('the shared agent link', () => {
  // The referral step runs the link through `new URL()`, and `webappUrl` is a
  // bare path in development.
  it('is absolute, so the referral params can be hung on it', () => {
    const link = agentShareLink('Rust in production');

    expect(() => new URL(link)).not.toThrow();
    expect(link.startsWith(globalThis.location.origin)).toBe(true);
  });

  it('carries the prompt to the screen that can spawn one', () => {
    const { pathname, searchParams } = new URL(
      agentShareLink('Rust in production'),
    );

    expect(pathname).toBe('/agent');
    expect(searchParams.get('q')).toBe('Rust in production');
  });

  it('survives a prompt with a question mark and an ampersand in it', () => {
    const prompt = 'What is shipping in AI agents? Rust & Zig';

    expect(new URL(agentShareLink(prompt)).searchParams.get('q')).toBe(prompt);
  });

  // The referral step rewrites the whole query string, turning encoded spaces
  // into `+`.
  it('still reads back as the prompt once the referral params are on it', () => {
    const prompt = 'Cool zig projects';
    const shared = addLogQueryParams({
      link: agentShareLink(prompt),
      userId: 'u1',
      cid: ReferralCampaignKey.ShareAgent,
    });

    const { searchParams } = new URL(shared as string);

    expect(searchParams.get('q')).toBe(prompt);
    expect(searchParams.get('cid')).toBe(ReferralCampaignKey.ShareAgent);
  });
});

describe('the share press', () => {
  const interest = { query: 'Rust in production' } as UserInterest;

  const held = () => {
    let finish = (): void => undefined;
    let fail = (): void => undefined;
    const share = jest.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          finish = resolve;
          fail = () => reject(new Error('the clipboard refused'));
        }),
    );

    jest
      .spyOn(shareOrCopyLink, 'useShareOrCopyLink')
      .mockReturnValue([false, share as never]);

    return {
      share,
      finish: () => finish(),
      fail: () => fail(),
    };
  };

  afterEach(() => jest.restoreAllMocks());

  it('says it is working until the shortened link comes back', async () => {
    const pipeline = held();
    const { result } = renderHook(() => useShareAgent(interest));

    expect(result.current.isSharing).toBe(false);

    await act(async () => {
      result.current.onShare();
    });

    expect(result.current.isSharing).toBe(true);

    await act(async () => {
      pipeline.finish();
    });

    expect(result.current.isSharing).toBe(false);
  });

  it('stops saying it is working when the share fails', async () => {
    const pipeline = held();
    const { result } = renderHook(() => useShareAgent(interest));

    await act(async () => {
      (result.current.onShare as () => Promise<void>)().catch(() => undefined);
    });

    await act(async () => {
      pipeline.fail();
    });

    expect(result.current.isSharing).toBe(false);
  });

  it('does nothing at all without a prompt to carry', async () => {
    const pipeline = held();
    const { result } = renderHook(() => useShareAgent(undefined));

    await act(async () => {
      result.current.onShare();
    });

    expect(pipeline.share).not.toHaveBeenCalled();
    expect(result.current.isSharing).toBe(false);
  });

  it('hands the pipeline a tracked link to this agent’s prompt', () => {
    const spy = jest
      .spyOn(shareOrCopyLink, 'useShareOrCopyLink')
      .mockReturnValue([false, jest.fn() as never]);

    renderHook(() => useShareAgent(interest));

    const [{ link, cid, text }] = spy.mock.calls[0];

    expect(new URL(link).searchParams.get('q')).toBe('Rust in production');
    expect(cid).toBe(ReferralCampaignKey.ShareAgent);
    expect(text).toContain('Rust in production');
  });
});
