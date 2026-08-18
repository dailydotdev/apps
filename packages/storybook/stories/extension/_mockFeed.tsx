import React from 'react';
import type { ReactElement } from 'react';

// Deterministic stand-in feed: enough cards to scroll, no network.
export const MOCK_POSTS = [
  'The pragmatic guide to shipping design systems',
  'Why your CI is slow (and the 3 fixes that matter)',
  'Postgres indexing mistakes everyone makes',
  'A tour of the new TypeScript compiler internals',
  'Rust vs. Go in 2026: what actually changed',
  'How we cut our bundle size by 60%',
  'The hidden cost of microservices',
  'LLM eval pipelines that do not lie to you',
  'Debugging production with zero downtime',
  'What I learned reviewing 1,000 pull requests',
  'The case for boring technology, revisited',
  'Feature flags: from chaos to control',
  'Edge rendering is eating the CDN',
  'Your retry logic is probably wrong',
  'Observability on a startup budget',
];

export function MockFeedCard({
  title,
  index,
}: {
  title: string;
  index: number;
}): ReactElement {
  return (
    <article className="flex h-72 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <div className="size-8 rounded-full bg-surface-float" />
      <h3 className="mt-3 line-clamp-3 font-bold text-text-primary typo-title3">
        {title}
      </h3>
      <div className="mt-auto flex flex-col gap-2">
        <div
          className="h-24 rounded-12 bg-surface-float"
          style={{ opacity: 0.5 + (index % 3) * 0.15 }}
        />
        <div className="h-3 w-2/3 rounded-4 bg-surface-float" />
      </div>
    </article>
  );
}

export function MockFeedGrid(): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
      {MOCK_POSTS.map((title, index) => (
        <MockFeedCard index={index} key={title} title={title} />
      ))}
    </div>
  );
}
