/**
 * @jest-environment node
 */
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from '../proxy';
import { MARKDOWN_ROUTES } from '../lib/markdownRoutes';

jest.mock('../lib/agentMarkdownAccess', () => ({
  evaluateAgentSignupWall: jest.fn(),
  getAgentSignupRequiredBody: jest.fn(),
  hasValidAgentMarkdownToken: jest.fn(),
  trackAgentSignupWallAllocation: jest.fn(),
}));

const runsOn = (url: string): boolean =>
  unstable_doesMiddlewareMatch({ config, url });

describe('proxy matcher', () => {
  it('runs on the post page and its markdown twin', () => {
    expect(runsOn('/posts/abc123')).toBe(true);
    expect(runsOn('/posts/abc123.md')).toBe(true);
    expect(runsOn('/api/md/posts/abc123')).toBe(true);
  });

  // The matcher spells these out, so a new markdown route that is missing
  // from it would skip the agent signup wall.
  it('runs on every markdown page', () => {
    Object.keys(MARKDOWN_ROUTES).forEach((path) => {
      expect(runsOn(`${path}.md`)).toBe(true);
    });
  });

  it('skips every other page', () => {
    expect(runsOn('/')).toBe(false);
    expect(runsOn('/squads/discover')).toBe(false);
    expect(runsOn('/sources/graalvm-blog')).toBe(false);
    expect(runsOn('/tags')).toBe(false);
  });
});
