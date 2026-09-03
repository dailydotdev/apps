import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostSnapshotCard } from '@dailydotdev/shared/src/features/snapshot/PostSnapshotCard';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { SnapshotButton } from '@dailydotdev/shared/src/components/imageShare/SnapshotButton';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';

const POST = {
  id: 'post-1',
  title: 'Why iconic tech brands like HTC and LG lost their dominance',
  summary:
    "A brief retrospective on how once-dominant tech and smartphone brands declined, citing OnePlus's recent troubles, LG's exit from the mobile business, and HTC's fall from once outselling Apple in America to a niche VR-focused company.",
  createdAt: '2026-08-24T09:00:00.000Z',
  readTime: 1,
  domain: 'xda-developers.com',
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

/** The card renders at 1080×1080; scale it down so it fits the review page. */
const Scaled = ({
  seed,
  scale = 0.42,
}: {
  seed: string;
  scale?: number;
}) => (
  <div
    style={{
      width: SNAPSHOT_SIZE * scale,
      height: SNAPSHOT_SIZE * scale,
      overflow: 'hidden',
      borderRadius: 16,
    }}
  >
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <PostSnapshotCard post={POST} seed={seed} />
    </div>
  </div>
);

const Example = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [capture, setCapture] = useState<string | null>(null);
  const [seed, setSeed] = useState(SEEDS[0]);

  return (
    <div className="flex flex-col gap-10 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-mega3">
          Post snapshot — square share image
        </h1>
        <p className="max-w-[46rem] text-text-tertiary typo-body">
          1080×1080. A branded purple gradient seeded from the post id, a black
          card carrying the source, headline, date, read time, domain and TLDR,
          and the logo stamped underneath.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className="font-bold text-text-primary typo-title3">
          Generate the real PNG
        </h3>
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-200vw] top-0"
        >
          <PostSnapshotCard ref={ref} post={POST} seed={seed} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SnapshotButton
            captureOptions={{
              width: SNAPSHOT_SIZE,
              height: SNAPSHOT_SIZE,
              padding: 0,
              branded: false,
            }}
            filename="daily-post-snapshot"
            label="Snapshot"
            onCapture={(blob) => setCapture(URL.createObjectURL(blob))}
            target={ref}
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
