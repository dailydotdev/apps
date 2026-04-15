import type { ReactElement } from 'react';
import React from 'react';

/** Public GitHub avatar URLs paired with display names (stable, cacheable). */
const SAMPLE_UPVOTERS: readonly { name: string; image: string }[] = [
  {
    name: 'Evan You',
    image: 'https://avatars.githubusercontent.com/u/499550?v=4',
  },
  {
    name: 'Rich Harris',
    image: 'https://avatars.githubusercontent.com/u/1162160?v=4',
  },
  {
    name: 'Guillermo Rauch',
    image: 'https://avatars.githubusercontent.com/u/14985020?v=4',
  },
  {
    name: 'Addy Osmani',
    image: 'https://avatars.githubusercontent.com/u/110953?v=4',
  },
  {
    name: 'Kent C. Dodds',
    image: 'https://avatars.githubusercontent.com/u/1500684?v=4',
  },
  {
    name: 'Sindre Sorhus',
    image: 'https://avatars.githubusercontent.com/u/170270?v=4',
  },
  {
    name: 'Josh W. Comeau',
    image: 'https://avatars.githubusercontent.com/u/17233843?v=4',
  },
  {
    name: 'Theo Browne',
    image: 'https://avatars.githubusercontent.com/u/6751787?v=4',
  },
  {
    name: 'Cassidy Williams',
    image: 'https://avatars.githubusercontent.com/u/1454517?v=4',
  },
  {
    name: 'Jason Miller',
    image: 'https://avatars.githubusercontent.com/u/105127?v=4',
  },
];

/** Stable hash for post id (same id → same value across renders). */
function hashPostId(postId: string): number {
  let h = 0;
  for (let i = 0; i < postId.length; i += 1) {
    h = (Math.imul(31, h) + postId.charCodeAt(i)) % 2147483647;
  }

  return Math.abs(h);
}

function pickIndexForPostId(postId: string): number {
  return hashPostId(postId) % SAMPLE_UPVOTERS.length;
}

/** ~40% of posts in “More stories” (latest) show the sample upvoter chip; stable per post id. */
export function shouldShowExploreUpvoterChip(postId: string): boolean {
  return hashPostId(postId) % 100 < 40;
}

export type ExploreUpvoterChipProps = {
  postId: string;
};

/**
 * Decorative sample “user upvoted” chip for explore rows (deterministic per post id).
 */
export const ExploreUpvoterChip = ({
  postId,
}: ExploreUpvoterChipProps): ReactElement => {
  const { name, image } = SAMPLE_UPVOTERS[pickIndexForPostId(postId)];

  return (
    <span
      className="inline-flex max-w-[min(100%,12rem)] shrink-0 items-center gap-1.5 rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2"
      style={{ fontSize: '13px' }}
    >
      <img
        src={image}
        alt=""
        className="h-4 w-4 shrink-0 rounded-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <span className="min-w-0 truncate">
        {name}
        {' upvoted'}
      </span>
    </span>
  );
};
