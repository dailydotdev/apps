import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/PostSnapshotCard';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { SnapshotButton } from '@dailydotdev/shared/src/components/imageShare/SnapshotButton';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

import { thumbUri } from './snapshotFixtures';

const POST = {
  id: 'post-1',
  title: 'Why iconic tech brands like HTC and LG lost their dominance',
  summary:
    "A brief retrospective on how once-dominant tech and smartphone brands declined, citing OnePlus's recent troubles, LG's exit from the mobile business, and HTC's fall from once outselling Apple in America to a niche VR-focused company.",
  createdAt: '2026-08-24T09:00:00.000Z',
  readTime: 1,
  domain: 'xda-developers.com',
  image: thumbUri('#3B2A63', '#171226', 'HTC · LG'),
  tags: ['tech-news', 'mobile', 'htc'],
  numUpvotes: 44,
  numComments: 11,
  analytics: { impressions: 429900 },
  source: {
    id: 'xda',
    name: 'XDA Developers',
    // Inline so the capture does not depend on a cross-origin fetch that MSW
    // intercepts inside Storybook.
    image: `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1E2229"/><path d="M18 40l14-24 14 24z" fill="#B14BD7"/></svg>',
    )}`,
  },
} as Post;

const SEEDS = ['post-1', 'ripgrep-rules', 'qwen-3-8-max', 'tabs-won'];

/** The card renders 1080 wide and as tall as its copy needs; scale it to fit. */
const Scaled = ({ seed, scale = 0.42 }: { seed: string; scale?: number }) => (
  <div
    style={{
      width: SNAPSHOT_SIZE * scale,
      overflow: 'hidden',
      borderRadius: 16,
    }}
  >
    {/* zoom, not transform: the box has to take the grown height. */}
    <div style={{ zoom: scale }}>
      <PostSnapshotCard post={POST} seed={seed} />
    </div>
  </div>
);

const Example = () => {
  const [capture, setCapture] = useState<string | null>(null);
  const [seed, setSeed] = useState(SEEDS[0]);

  return (
    <div className="flex flex-col gap-10 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-mega3">
          Post snapshot — share image
        </h1>
        <p className="max-w-[46rem] text-text-tertiary typo-body">
          1080 wide, as tall as the copy needs. A branded purple gradient seeded
          from the post id, and a black card that leads with the TLDR in white,
          then credits it: headline, source, date.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className="font-bold text-text-primary typo-title3">
          Generate the real PNG
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* card, not target: the button mounts and measures the frame
              itself, so a grown height reaches the capture. */}
          <SnapshotButton
            card={<PostSnapshotCard post={POST} seed={seed} />}
            filename="daily-post-snapshot"
            label="Snapshot"
            onCapture={(blob) => setCapture(URL.createObjectURL(blob))}
          />
          {SEEDS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSeed(value)}
              className={`rounded-10 border px-3 py-1 typo-footnote ${
                seed === value
                  ? 'border-border-subtlest-primary text-text-primary'
                  : 'border-border-subtlest-tertiary text-text-tertiary'
              }`}
            >
              seed: {value}
            </button>
          ))}
        </div>
        {capture && (
          <img
            src={capture}
            alt="Generated post snapshot"
            className="w-full max-w-[34rem] rounded-16 border border-border-subtlest-tertiary"
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-bold text-text-primary typo-title3">
          Gradient variety
        </h3>
        <p className="text-text-tertiary typo-callout">
          The same post rendered under four different seeds — each post id lands
          on its own gradient, and re-sharing the same post reproduces it.
        </p>
        <div className="flex flex-wrap gap-4">
          {SEEDS.map((value) => (
            <Scaled key={value} seed={value} />
          ))}
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof Example> = {
  title: 'Features/Snapshot/Post share image',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const PostShareImage: StoryObj<typeof Example> = {};
