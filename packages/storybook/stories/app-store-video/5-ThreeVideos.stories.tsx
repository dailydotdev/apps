import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Table, Verdicts } from './parts';
import { Player } from './timeline';
import { fetchVideo, signalVideo, tapVideo } from './videos';
import { frameFor } from './canvases';

const meta: Meta = {
  title: 'App Store Video/5. Three videos',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const ThreeVideos: StoryObj = {
  name: '5. Three videos',
  render: () => (
    <Page
      chapter="5"
      question="What are the three videos?"
      title="Patchy, the promise, and the app in your hand"
      goal="Three videos with three jobs: charm on the product page, the value at a glance in search, and the real app in the preview. Each one plays here as an animatic before anything is rendered."
      metric="Impressions to product page views for the search video, page views to installs for the header and the preview, each read in its own Product Page Optimization test."
    >
      <Case
        title="Why each video sits where it does"
        note="The slot decides what a video is allowed to be. Only the two new creative-asset slots may carry a mascot or kinetic type; the preview must be the app."
      >
        <Verdicts
          items={[
            {
              label: '1 · Fetch → product page header',
              text: 'Patchy, our mascot, dashes in with the day’s news in his mouth, drops it, and it unrolls into a real post. Brand and charm, which the header is for.',
              tone: 'good',
            },
            {
              label: '2 · Signal → search results',
              text: 'The value as moving type: a counter rolls to 2,000+ sources, the noise collapses into one feed, a long post shrinks to its TLDR. Reads muted, at thumbnail size.',
              tone: 'good',
            },
            {
              label: '3 · Tap → app preview',
              text: 'The app itself. Each component you touch lifts out of the screen as you tap it: upvote, TLDR, bookmark, topics, streak. Real components, real posts.',
              tone: 'good',
            },
          ]}
        />
      </Case>
      <Case
        title="1 · Fetch · header · 21:9 · 9 s loop · silent"
        note="The pun is the pitch: a dog that fetches, an app that fetches your news. Patchy is new art in his 3D style (running with the paper, sitting proud, the paper itself); the line stays inside the template's safe area, so every crop keeps it."
      >
        <Player video={fetchVideo} frame={frameFor('header')} />
      </Case>
      <Case
        title="2 · Signal · search results · 3:2 · 9 s loop · silent"
        note="Two pieces of type move and carry the message: the counter, then the summary squeezing to its TLDR. The poster frame is the end state, so the thumbnail says the whole promise even with autoplay off."
      >
        <Player video={signalVideo} frame={frameFor('search')} />
      </Case>
      <Case
        title="3 · Tap · app preview · 886 × 1920 · 18 s"
        note="A recording on a device, with the lifted components and touch ripples as overlays, which Apple allows. Captions sit low, over the card art, so no title is covered. The end card discloses the login."
      >
        <Player video={tapVideo} frame={frameFor('preview')} />
      </Case>
      <Case title="Copy">
        <Table
          head={['Video', 'On screen', 'Why it is safe']}
          rows={[
            [
              '1 · Fetch',
              '"Fresh dev news, fetched daily." / "A TLDR on every post."',
              'Describes what the app does; no claims, prices or dates',
            ],
            [
              '2 · Signal',
              '"2,000+ sources" / "One feed." / "A TLDR on every post."',
              '2,000+ is the number our own description states, so it is verifiable',
            ],
            [
              '3 · Tap',
              '"Upvote what’s good" / "Read the TLDR first" / "Save it for later" / "Jump to your topics" / "Build a reading streak" / end card',
              'Each caption names what the footage shows at that moment',
            ],
          ]}
        />
      </Case>
      <Case title="What moves, and how">
        <Bullets
          items={[
            'Entrances are a blur plus a short rise, exits a plain fade, all eased out with no bounce, the motion rules the rest of the product follows.',
            'Every video is a function of time, so the animatic, the storyboard frames and the final render are the same code. Videos 2 and 3 can be rendered straight from it at 30 fps with no generation credits.',
            'Patchy is the only part that needs generated motion: a Runway pass turns the running pose into a real run cycle and the sitting pose into a wag. Everything around him stays this code.',
          ]}
        />
      </Case>
    </Page>
  ),
};
