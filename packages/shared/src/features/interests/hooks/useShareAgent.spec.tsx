import { agentShareLink } from './useShareAgent';
import { webappUrl } from '../../../lib/constants';

/**
 * What travels when an agent is shared is the standing prompt, not the
 * transcript: there is nowhere to send someone for a conversation, and a
 * question that keeps working for the recipient is worth more than a snapshot of
 * someone else's findings.
 */
describe('the shared agent link', () => {
  it('carries the prompt to the screen that can spawn one', () => {
    expect(agentShareLink('Rust in production')).toBe(
      `${webappUrl}agent?q=Rust%20in%20production`,
    );
  });

  it('survives a prompt with a question mark and an ampersand in it', () => {
    // `webappUrl` is relative under test, so the parse needs a base.
    const link = new URL(
      agentShareLink('What is shipping in AI agents? Rust & Zig'),
      'https://app.daily.dev',
    );

    expect(link.searchParams.get('q')).toBe(
      'What is shipping in AI agents? Rust & Zig',
    );
  });
});
