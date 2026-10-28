import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Table } from './parts';
import { creativeRules, previewRules } from './data';

const meta: Meta = {
  title: 'App Store Video/3. Rules',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Rules: StoryObj = {
  name: '3. Rules',
  render: () => (
    <Page
      chapter="3"
      question="What gets a video rejected, and how does it ship?"
      title="Previews are evidence, creative assets are advertising"
      goal="Produce each video to the rule set of its slot the first time, so no round trip through App Review."
      metric="Approved on first submission."
    >
      <Case
        title="App preview: guideline 2.3.4 and the forum rejections"
        note="The preview is a screen capture with explanations on top. Everything else Apple reads as misleading."
      >
        <Bullets items={previewRules} />
      </Case>
      <Case
        title="Header and search video: guideline 2.3.14 and the asset best practices"
        note="Creative assets may show brand and value, which is why a motion-design piece is allowed here and not in the preview."
      >
        <Bullets items={creativeRules} />
      </Case>
      <Case title="Checklist for our storyboard against both">
        <Table
          head={['Rule', 'Header and search', 'Preview']}
          rows={[
            [
              'Real app UI',
              'The production list card with public posts',
              'Device recording, native resolution',
            ],
            [
              'Device frames or hands',
              'None; the screen is cropped, no bezel',
              'None',
            ],
            [
              'Other platforms, prices, dates',
              'None. No Chrome or Android mention, no "free forever", no release dates',
              'None; "Free" is allowed as a disclosure, not a price',
            ],
            [
              'Login disclosure',
              'Not required for creative assets',
              'End card: "Free. Sign in with GitHub or Google."',
            ],
            [
              'Third-party content',
              'Post titles and source logos as the public feed shows them; no tool trademarks as decoration',
              'Same, as recorded',
            ],
            [
              'Real people',
              'No avatars of real users; sources only',
              'A fresh test account with a stock streak',
            ],
            [
              'Text',
              'One headline, localized later per storefront',
              'Captions of five words or fewer, over the card art above the bar',
            ],
            [
              'Sound',
              'Silent',
              'A silent stereo AAC track, or a short music loop',
            ],
            ['Loop', 'Ends on the opening frame', 'Does not loop'],
            [
              'Poster frame',
              'Frame 1 (headline and cards at rest)',
              'The feed with the first caption, at 2 seconds',
            ],
          ]}
        />
      </Case>
      <Case
        title="How each one ships"
        note="Roles: Account Holder, Admin, App Manager or Marketing."
      >
        <Table
          head={['Step', 'Header and search', 'Preview']}
          rows={[
            [
              'Upload',
              'App → Asset Library → + → Upload Creative Assets',
              'Version page → iPhone 6.9" previews (scales down to the rest)',
            ],
            [
              'Review',
              'Submit standalone; reviewed against the live version, no new build',
              'With the version, or as a Product Page Optimization treatment',
            ],
            [
              'Placement',
              'Version → Product Page Information → Header and Search Results → Browse Assets',
              'Automatic: previews show before screenshots',
            ],
            [
              'Preview',
              'Preview button: iPhone, iPad, orientations, languages, Dark Mode',
              'Same tool',
            ],
            [
              'Change later',
              'Swap any approved asset, live, without a submission',
              'New version or new test; poster frame locked',
            ],
            [
              'Test',
              'PPO: header video vs none, one treatment',
              'PPO: preview vs none, after the screenshot test',
            ],
          ]}
        />
      </Case>
    </Page>
  ),
};
