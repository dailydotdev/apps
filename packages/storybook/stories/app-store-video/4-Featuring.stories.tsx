import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Table, Verdicts } from './parts';
import { featuringFactors, featuringLevers, forumFindings } from './data';

const meta: Meta = {
  title: 'App Store Video/4. Featuring',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Featuring: StoryObj = {
  name: '4. Featuring',
  render: () => (
    <Page
      chapter="4"
      question="What do forums and Apple say helps the store promote an app?"
      title="Editors score the page, and they like early adopters"
      goal="Pair the video work with the cheap things that make Apple's editors and algorithm notice the listing."
      metric="A featuring nomination submitted with the iOS 27 assets; impressions from Browse in App Analytics."
    >
      <Case
        title="What Apple's editors say they look for"
        note='From "Getting featured": no checklist, seven factors. The product page is one of them, and app previews are named in it.'
      >
        <Table head={['Factor', 'In their words']} rows={featuringFactors} />
      </Case>
      <Case title="Levers, scored against where we stand">
        <Verdicts items={featuringLevers} />
      </Case>
      <Case
        title="What developers report"
        note="Apple Developer Forums, ASO blogs and the X thread from October 19. Nothing here is a measurement; it is what practitioners repeat."
      >
        <Bullets items={forumFindings} />
      </Case>
      <Case title="The nomination that goes with this video">
        <Bullets
          items={[
            'Type: App Enhancements. Hook: the iOS 27 product page header and search video, adopted in the first weeks, plus the redesigned feed shipped in 1.25.',
            'Lead time: at least two weeks before the assets go live; three months for a Today-tab story. Submit the day the assets are approved.',
            'What to attach: the header video, the search video, the preview, and three sentences on why a developer-only feed with a TLDR on every post is a fresh approach to the News category.',
            'Keep the Admin and Marketing roles watching email: Apple requests promotional artwork from those roles when an app is being considered.',
          ]}
        />
      </Case>
    </Page>
  ),
};
