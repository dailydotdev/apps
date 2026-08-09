import { agentShareLink } from './useShareAgent';
import { addLogQueryParams } from '../../../lib/share';
import { ReferralCampaignKey } from '../../../lib/referral';

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
