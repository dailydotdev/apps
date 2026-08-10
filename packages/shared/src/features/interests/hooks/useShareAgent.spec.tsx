import { act, renderHook } from '@testing-library/react';
import { agentShareLink, useShareAgent } from './useShareAgent';
import { addLogQueryParams } from '../../../lib/share';
import { ReferralCampaignKey } from '../../../lib/referral';
import * as shareOrCopyLink from '../../../hooks/useShareOrCopyLink';
import type { UserInterest } from '../../../graphql/interests';

/**
 * What travels when an agent is shared is the standing prompt, not the
 * transcript: there is nowhere to send someone for a conversation, and a
 * question that keeps working for the recipient is worth more than a snapshot of
 * someone else's findings.
 */
describe('the shared agent link', () => {
  // The share pipeline hangs the referral params on the link with `new URL()`,
  // and `webappUrl` is a bare path in development — so a relative link threw
  // "Failed to construct 'URL'" the moment the button was pressed, rather than
  // degrading to an unreferred link.
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

  // The referral step rewrites the whole query string, turning the encoded
  // spaces into `+`. That decodes back to a space the way Next parses a query,
  // but it is the one step between the sharer and the recipient that could
  // quietly mangle the prompt, so it is asserted rather than assumed.
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

/**
 * Between the press and the clipboard there is a request: the link gets
 * shortened first. It is usually instant and it is sometimes not, and a control
 * that looks identical either way is a control that looks broken.
 */
describe('the share press', () => {
  const interest = { query: 'Rust in production' } as UserInterest;

  /** The share pipeline, held open until the test lets it finish. */
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

  // The `finally`, and the reason it is one: a share that throws on its way to
  // the clipboard would otherwise leave the button spinning for the rest of the
  // session, with nothing the reader can do to reset it.
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

  // There is nothing to share before the agent has loaded, and a press that
  // opened the system sheet on an empty prompt would share a bare link to the
  // agents screen.
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
