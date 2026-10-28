import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Sources, Table, Verdicts } from './parts';
import { sources } from './data';

const meta: Meta = {
  title: 'App Store Video/0. Start here',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const StartHere: StoryObj = {
  name: '0. Start here',
  render: () => (
    <Page
      chapter="0"
      question="Which video goes on the App Store, and where?"
      title="Three autoplay slots, one message, built in steps"
      goal="Put daily.dev in motion on the App Store without spending video budget before the frames are agreed: research first, a storyboard to approve, then footage."
      metric="Impressions to product page views (the funnel's weak step, 14.7%), then page views to installs (68%), both read from a Product Page Optimization test rather than a before/after."
    >
      <Case
        title="What changed"
        note="On October 5, 2026 Apple opened two new autoplaying video placements to every app, and on October 16 wrote the rule that governs them. The slot we already had, the app preview, is unchanged. Nimrod flagged the new ones on October 19; Tsahi's X link from today shows what an early adopter did with the header."
      >
        <Verdicts
          items={[
            {
              label: 'Header video · new',
              text: 'A 21:9 looping, muted clip at the very top of the product page, above the icon. Brand and value allowed, not only the app in use. iOS 27 only.',
              tone: 'good',
            },
            {
              label: 'Search results video · new',
              text: 'A 3:2 looping, always-muted clip that replaces the screenshots in search results. Attacks the funnel step we lose the most on. iOS 27 only.',
              tone: 'good',
            },
            {
              label: 'App preview · existing',
              text: 'The 15 to 30 second portrait video before the screenshots. Screen captures only, everyone sees it. Our page already converts at 68%, so it is the last of the three to build.',
              tone: 'warn',
            },
          ]}
        />
      </Case>
      <Case
        title="The recommendation"
        note="One idea on every surface, the listing's own opener: what developers are reading today, with a TLDR on every post. Real posts from the real feed, in motion."
      >
        <Table
          head={['Step', 'What', 'Cost', 'Gate']}
          rows={[
            [
              '1. Storyboard (this Storybook)',
              'Frames for the header, the search asset and the preview, composed from the production card and the live feed',
              'Done',
              'Tsahi approves the frames and the copy in chapter 6',
            ],
            [
              '2. Header + search videos',
              'Motion design from the approved frames: Smith animates stills with Runway, cuts and exports 3840 × 1646 and 3:2 at 30 fps, silent, seamless loop',
              'Runway credits, about a day',
              'Preview in App Store Connect on iPhone, iPad, both orientations, Dark Mode',
            ],
            [
              '3. Ship as a test',
              'Upload to Asset Library, submit standalone, then a Product Page Optimization test: header video vs none',
              'None',
              '90% confidence in App Analytics; apply the winner',
            ],
            [
              '4. App preview',
              'Record the six scenes on a 6.9" iPhone over QuickTime, Smith captions and cuts to 22 seconds with an audio track',
              'An hour of recording, a day of edit',
              'Only after the screenshot test from the July plan has a winner, as a second PPO test',
            ],
          ]}
        />
      </Case>
      <Case title="Why this order">
        <Bullets
          items={[
            'The July analytics say the listing loses people before the page, not on it: 1 in 7 impressions tap through, 2 in 3 page views install. The search results video is the only one of the three that plays before the tap.',
            'Header and search videos can be motion design, so they ship without touching the app and swap later without a release. The preview must be real footage, so it waits for a recording session.',
            "Vendors report +16% to +35% from preview videos, but Apple's own case study shows a page without video winning. Every lift here is a hypothesis for a test, not a promise.",
            'Almost nobody has a header video yet. For a few months a moving header is a reason to tap on its own.',
          ]}
        />
      </Case>
      <Case title="Chapters">
        <Table
          head={['Chapter', 'Question it answers']}
          rows={[
            [
              '1. Surfaces',
              'Where exactly does each video play, at what size, for whom?',
            ],
            [
              '2. Evidence',
              'Does video move installs, and which of our funnel steps needs it?',
            ],
            ['3. Rules', 'What gets a video rejected, and how does it ship?'],
            [
              '4. Featuring',
              'What do forums and Apple say helps the store promote an app?',
            ],
            ['5. Concepts', 'Which of three directions should the video be?'],
            ['6. Storyboard', 'Frame by frame, what will be produced?'],
            [
              '7. Production',
              'Who does what, in what order, and how is it measured?',
            ],
          ]}
        />
      </Case>
      <Case title="Sources">
        <Sources items={sources} />
      </Case>
    </Page>
  ),
};
