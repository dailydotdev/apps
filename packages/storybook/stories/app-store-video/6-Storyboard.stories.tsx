import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Bullets,
  Canvas,
  Case,
  Page,
  Storyboard,
  useSafeToggle,
} from './parts';
import { HeaderFrame, PreviewFrame, SearchFrame } from './frames';
import type { PreviewScene } from './frames';

const meta: Meta = {
  title: 'App Store Video/6. Storyboard',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const previewScenes: { at: string; scene: PreviewScene; motion: string }[] = [
  {
    at: '0:00',
    scene: 'open',
    motion:
      'The app opens on the feed. No caption yet: the first frame is the product. Two seconds of a slow scroll; this frame at 0:02 is the poster frame.',
  },
  {
    at: '0:03',
    scene: 'scroll',
    motion:
      'Caption fades in. The feed scrolls past three or four cards from different sources, unhurried, one card per second.',
  },
  {
    at: '0:07',
    scene: 'tldr',
    motion:
      'A tap on "Show more": the TLDR opens in place. Hold two seconds so it can be read, then scroll on.',
  },
  {
    at: '0:11',
    scene: 'topic',
    motion:
      'A tap on a topic chip above the feed: the feed re-sorts to that topic. The chip gets a touch hotspot ring, which Apple allows.',
  },
  {
    at: '0:15',
    scene: 'bookmark',
    motion:
      'A tap on bookmark on a card, then the streak flame in the header ticks from 53 to 54 with its confetti. Two seconds.',
  },
  {
    at: '0:19',
    scene: 'end',
    motion:
      'Dissolve to the end card: logo, the headline, and the login disclosure. Holds to 0:22.',
  },
];

export const StoryboardPage: StoryObj = {
  name: '6. Storyboard',
  render: () => {
    const [safe, toggle] = useSafeToggle();
    return (
      <Page
        chapter="6"
        question="Frame by frame, what will be produced?"
        title="One composition, three cuts"
        goal="Agree every frame before any motion is rendered or any footage is recorded, since both cost credits and a recording session."
        metric="Approval of this page; then the Product Page Optimization results in chapter 7."
      >
        <Case
          title="Header video · 12-second loop · 3840 × 1646"
          note="The headline sits in the safe rectangle, centered, and never moves. The feed runs on both sides of it, enlarged so a title is readable on a phone and cropped by the edges so it reads as a stream, not a mock-up. On an iPad crop only the headline and the inner edges of the cards remain, which is the intent. Silent."
        >
          {toggle}
          <Storyboard
            frames={[
              {
                at: '0:00',
                motion:
                  'The cards rise in from 40px below, from 35% to full opacity, over 0.8 seconds. The headline is already there: this is also the poster frame, so it must carry the message alone.',
                frame: (
                  <Canvas placement="header" safe={safe} id="header-0">
                    <HeaderFrame step={0} />
                  </Canvas>
                ),
              },
              {
                at: '0:01',
                motion:
                  'At rest. Hold three seconds; the source logo and title are what people read.',
                frame: (
                  <Canvas placement="header" safe={safe} id="header-1">
                    <HeaderFrame step={1} />
                  </Canvas>
                ),
              },
              {
                at: '0:04',
                motion:
                  'The TLDR on the first card opens in place, pushing the second card down. Hold four seconds so it can be read.',
                frame: (
                  <Canvas placement="header" safe={safe} id="header-2">
                    <HeaderFrame step={2} />
                  </Canvas>
                ),
              },
              {
                at: '0:08',
                motion:
                  'The feed advances: the first card slides up and out, the next two take its place, the TLDR closed. Hold three seconds, then dissolve back to 0:01 for the loop join.',
                frame: (
                  <Canvas placement="header" safe={safe} id="header-3">
                    <HeaderFrame step={3} />
                  </Canvas>
                ),
              },
            ]}
          />
        </Case>
        <Case
          title="Search results video · 8-second loop · 3840 × 2560"
          note="The same headline over the screen itself, no bezel. In search it is a thumbnail, so each frame changes one thing and holds. Muted; cannot be unmuted."
        >
          <Storyboard
            frames={[
              {
                at: '0:00',
                motion:
                  'The feed at rest under the headline. Poster frame. Hold two seconds.',
                frame: (
                  <Canvas placement="search" safe={safe} id="search-0">
                    <SearchFrame step={0} />
                  </Canvas>
                ),
              },
              {
                at: '0:02',
                motion:
                  'The feed scrolls one card up over 0.6 seconds, eased. Hold.',
                frame: (
                  <Canvas placement="search" safe={safe} id="search-1">
                    <SearchFrame step={1} />
                  </Canvas>
                ),
              },
              {
                at: '0:04',
                motion:
                  "The top card's TLDR opens. Hold two seconds. This is the one frame that proves the subtitle.",
                frame: (
                  <Canvas placement="search" safe={safe} id="search-2">
                    <SearchFrame step={2} />
                  </Canvas>
                ),
              },
              {
                at: '0:06',
                motion:
                  'A ring lands on the "AI" chip and the feed re-sorts behind it. Hold, then dissolve to 0:00.',
                frame: (
                  <Canvas placement="search" safe={safe} id="search-3">
                    <SearchFrame step={3} />
                  </Canvas>
                ),
              },
            ]}
          />
        </Case>
        <Case
          title="App preview · 22 seconds · 886 × 1920 · phase 3"
          note="A recording, not motion design: these frames are the shot list for the device session, drawn with the production layout. Captions are five words or fewer, laid over the card art above the bar so no title or source is covered, in the app's own type on the app's own background. The streak count and account are a fresh test user."
        >
          <div className="no-scrollbar overflow-x-auto">
            <ol className="flex gap-6">
              {previewScenes.map(({ at, scene, motion }) => (
                <li
                  key={at}
                  className="flex w-[22.5rem] shrink-0 flex-col gap-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold tabular-nums text-text-primary typo-caption1">
                      {at}
                    </span>
                    <span className="font-bold text-text-tertiary typo-caption1">
                      {scene}
                    </span>
                  </div>
                  <div
                    className="overflow-hidden rounded-24 border border-border-subtlest-tertiary"
                    data-frame
                    id={`preview-${scene}`}
                  >
                    <PreviewFrame scene={scene} />
                  </div>
                  <p className="text-text-secondary typo-footnote">{motion}</p>
                </li>
              ))}
            </ol>
          </div>
        </Case>
        <Case title="What is fixed and what is open">
          <Bullets
            items={[
              'Fixed: the headline "What developers are reading today" on every surface, the production list card, public posts from the live feed, the aurora of the current screenshots, silence, the loop joins.',
              'Open for Tsahi: the accent word (today vs TLDR), whether the header shows the feed on both sides or one enlarged card to the right, and whether the search video gets the topic-chip beat or holds the TLDR longer.',
              'Open for Smith: the exact easing and the dissolve length, and the source of the aurora (the hero illustration behind the live screenshots, not a gradient).',
              'Not in this phase: the preview recording. It needs the 1.25 build on a 6.9" iPhone, a test account with a 53-day streak, and QuickTime over a cable.',
            ]}
          />
        </Case>
      </Page>
    );
  },
};
