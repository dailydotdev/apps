import type { GQLPersona } from '@dailydotdev/shared/src/graphql/feedSettings';
import { buildSwipePrompt } from './buildSwipePrompt';

const frontend: GQLPersona = {
  id: 'frontend',
  title: 'Frontend',
  emoji: '🌐',
  tags: ['react', 'typescript', 'css'],
};

const backend: GQLPersona = {
  id: 'backend',
  title: 'Backend',
  emoji: '🖥️',
  tags: ['node', 'typescript', 'sql'],
};

describe('buildSwipePrompt', () => {
  it('returns empty string when no personas are picked', () => {
    expect(buildSwipePrompt({ personas: [] })).toBe('');
    expect(buildSwipePrompt({})).toBe('');
  });

  it('builds a prompt for a single persona without experience level', () => {
    expect(buildSwipePrompt({ personas: [frontend] })).toBe(
      "I'm a frontend engineer. I'm interested in: react, typescript, css.",
    );
  });

  it('includes the experience-level label when provided', () => {
    expect(
      buildSwipePrompt({
        personas: [frontend],
        experienceLevel: 'MORE_THAN_2_YEARS',
      }),
    ).toBe(
      "I'm a frontend engineer (Mid-level (2-3 years)). I'm interested in: react, typescript, css.",
    );
  });

  it('joins multiple personas and dedupes overlapping tags', () => {
    expect(
      buildSwipePrompt({
        personas: [frontend, backend],
      }),
    ).toBe(
      "I work across frontend and backend. I'm interested in: react, typescript, css, node, sql.",
    );
  });

  it('omits the interests clause when personas have no tags', () => {
    expect(
      buildSwipePrompt({
        personas: [{ ...frontend, tags: [] }],
      }),
    ).toBe("I'm a frontend engineer.");
  });

  it('does not duplicate engineer for engineering persona titles', () => {
    expect(
      buildSwipePrompt({
        personas: [
          {
            ...frontend,
            title: 'Site Reliability Engineer',
            tags: [],
          },
        ],
      }),
    ).toBe("I'm a site reliability engineer.");
  });

  it('preserves engineer in multi-persona titles without stripping other roles', () => {
    expect(
      buildSwipePrompt({
        personas: [
          {
            ...frontend,
            title: 'Site Reliability Engineer',
            tags: [],
          },
          backend,
        ],
      }),
    ).toBe(
      "I work across site reliability engineer and backend. I'm interested in: node, typescript, sql.",
    );
  });
});
