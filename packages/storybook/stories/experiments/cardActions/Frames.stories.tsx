import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import ExtensionProviders from '../../extension/_providers';
import { RealCard, realPosts } from './swap';
import { conceptById } from './concepts';
import { FeedShell, columnsForViewport, isLaptop } from './shell';
import type { FrameArgs } from './frames';

/**
 * The page each breakpoint frame loads: the feed shell at the iframe's real
 * width, filled with the live-feed snapshot, with one concept and one feed
 * spacing applied. Hidden from the sidebar; the review pages embed it.
 */
const FeedFrame = ({ concept, gap, side, sidebar, seed = 0 }: FrameArgs) => {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const { slots } = conceptById(concept);
  const bar = sidebar ?? 'open';
  const cols = columnsForViewport(width, bar);
  const list = !isLaptop(width);
  const posts = [...realPosts.slice(seed), ...realPosts.slice(0, seed)].slice(
    0,
    list ? 8 : cols * 3,
  );

  return (
    <FeedShell width={width} sidebar={bar} side={side}>
      {list ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <RealCard key={post.id} post={post} slots={slots} list />
          ))}
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gap,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {posts.map((post) => (
            <RealCard key={post.id} post={post} slots={slots} />
          ))}
        </div>
      )}
    </FeedShell>
  );
};

const meta: Meta<FrameArgs> = {
  title: 'Experiments/Card actions/Frames',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  args: { concept: 'today', gap: 32, side: 40, sidebar: 'open', seed: 0 },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
  render: (args): ReactElement => <FeedFrame {...args} />,
};

export default meta;

export const FeedFrameStory: StoryObj<FrameArgs> = { name: 'Feed frame' };
