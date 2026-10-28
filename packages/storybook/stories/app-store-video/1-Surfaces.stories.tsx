import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  Bullets,
  Canvas,
  Case,
  DarkArt,
  Page,
  Table,
  useSafeToggle,
} from './parts';
import { specHead, specRows } from './data';
import { HeaderFrame, SearchFrame } from './frames';

const meta: Meta = {
  title: 'App Store Video/1. Surfaces',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** A row of the App Store's search results, the way iOS 27 draws ours. */
const SearchResult = ({ video }: { video: boolean }): ReactElement => (
  <div className="flex w-[23.4375rem] shrink-0 flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-background-default p-4">
    <div className="flex items-center gap-3">
      <span className="flex size-14 items-center justify-center rounded-14 bg-surface-float">
        <LogoIcon className={{ container: 'h-7 w-auto' }} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-text-primary typo-callout">
          daily.dev: AI &amp; Tech News Feed
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          Dev headlines, daily briefing
        </span>
        <span className="text-text-quaternary typo-caption1">★ 4.3 · 41</span>
      </span>
      <span className="rounded-max bg-surface-float px-4 py-1.5 font-bold text-text-link typo-callout">
        Get
      </span>
    </div>
    {video ? (
      <div
        className="relative overflow-hidden rounded-16"
        style={{ aspectRatio: '3 / 2' }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: 900, height: 600, transform: 'scale(0.3811)' }}
        >
          <DarkArt className="size-full">
            <SearchFrame step={2} />
          </DarkArt>
        </div>
      </div>
    ) : (
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={classNames(
              'h-56 flex-1 rounded-12 bg-surface-float',
              index === 2 && 'opacity-50',
            )}
          />
        ))}
      </div>
    )}
  </div>
);

/** The product page on iOS 27: header, then the app row, then the gallery. */
const ProductPage = (): ReactElement => (
  <div className="flex w-[23.4375rem] shrink-0 flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default">
    <div className="relative overflow-hidden" style={{ aspectRatio: '21 / 9' }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 1120, height: 480, transform: 'scale(0.3348)' }}
      >
        <DarkArt className="size-full">
          <HeaderFrame step={1} />
        </DarkArt>
      </div>
      <span className="absolute left-3 top-3 rounded-8 bg-background-default px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption2">
        header video · loops muted
      </span>
    </div>
    <div className="flex items-center gap-3 p-4">
      <span className="flex size-[4.5rem] items-center justify-center rounded-16 bg-surface-float">
        <LogoIcon className={{ container: 'h-9 w-auto' }} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-title3">
          daily.dev
        </span>
        <span className="text-text-tertiary typo-footnote">
          Dev headlines, daily briefing
        </span>
        <span className="mt-1 w-fit rounded-max bg-text-link px-4 py-1 font-bold text-white typo-callout">
          Get
        </span>
      </span>
    </div>
    <div className="flex gap-3 overflow-hidden px-4 pb-4">
      <span className="relative h-[27rem] w-[13.5rem] shrink-0 overflow-hidden rounded-16 border border-accent-cabbage-default bg-surface-float">
        <span className="absolute left-2 top-2 rounded-8 bg-background-default px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption2">
          app preview · autoplays
        </span>
      </span>
      <span className="h-[27rem] w-[13.5rem] shrink-0 rounded-16 bg-surface-float" />
    </div>
  </div>
);

export const Surfaces: StoryObj = {
  name: '1. Surfaces',
  render: () => {
    const [safe, toggle] = useSafeToggle();
    return (
      <Page
        chapter="1"
        question="Where exactly does each video play?"
        title="The three autoplay slots, side by side"
        goal="Know each placement's size, audience and rules before designing for it, so the storyboard is cut once."
        metric="None; this chapter is reference."
      >
        <Case
          title="On the phone"
          note="Left: a search result on iOS 27 with the search results video in place of the three screenshots. Right: the product page with the header video above the app row and the app preview first in the gallery. On iOS 26 and earlier the left card shows screenshots and the page has no header."
        >
          <div className="flex flex-wrap items-start gap-6">
            <SearchResult video />
            <ProductPage />
            <SearchResult video={false} />
          </div>
        </Case>
        <Case
          title="Specification"
          note="From Apple's App Store Connect references, checked October 28, 2026."
        >
          <Table head={specHead} rows={specRows} />
        </Case>
        <Case
          title="Safe areas"
          note="Apple's templates define a safe rectangle for the header and the search asset; the rest is cropped per device and orientation. Measured off the Sketch template: the header keeps 43% of its width and 40% of its height, the search asset 56% and 40%. Everything that carries the message lives inside the dashed box."
        >
          {toggle}
          <div className="flex flex-col gap-6">
            <Canvas
              placement="header"
              safe={safe}
              label="Header · 3840 × 1646"
              note="shown at 1120 × 480"
            >
              <HeaderFrame step={1} />
            </Canvas>
            <Canvas
              placement="search"
              safe={safe}
              label="Search results · 3840 × 2560"
              note="shown at 900 × 600"
            >
              <SearchFrame step={2} />
            </Canvas>
          </div>
        </Case>
        <Case title="What this means for the design">
          <Bullets
            items={[
              'The header is wide and short. On an iPhone it is about 393 by 168 points, so a card title at the production size is 5 points tall. The feed must be enlarged, and only the headline can be trusted to read everywhere.',
              'The search asset is a thumbnail about 361 by 240 points next to other apps. The purpose has to read in the first frame, muted, with the loop join invisible.',
              'The preview is the one slot that reaches every iOS version, but the page it sits on already converts well. It is honest footage with captions, nothing more.',
              'All three can carry one headline. Reusing it across header, search and preview is what Apple calls a cohesive story, and it is cheaper.',
            ]}
          />
        </Case>
      </Page>
    );
  },
};
