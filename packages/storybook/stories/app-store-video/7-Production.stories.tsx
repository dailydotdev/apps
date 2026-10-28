import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Bullets, Case, Page, Table } from './parts';

const meta: Meta = {
  title: 'App Store Video/7. Production',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Production: StoryObj = {
  name: '7. Production',
  render: () => (
    <Page
      chapter="7"
      question="Who does what, in what order, and how is it measured?"
      title="Approve, animate, test, then record"
      goal="Ship the header and search videos within two weeks of approval as a measured test, and schedule the preview recording behind the screenshot test."
      metric="Impressions to page views on the treatment at 90% confidence; page views to installs and day-7 retention of the treatment cohort as guardrails."
    >
      <Case title="Plan">
        <Table
          head={['When', 'Who', 'What', 'Output']}
          rows={[
            [
              'Day 0',
              'Tsahi',
              'Approve or edit the storyboard (chapter 6) and the open questions',
              'Signed-off frames',
            ],
            [
              'Day 1',
              'Smith',
              'Export the header and search frames at full size from this Storybook, animate the four beats with Runway, cut in ffmpeg: 3840 × 1646 and 3840 × 2560, 30 fps, H.264, silent, 12 s and 8 s loops',
              'Two .mp4 files and a poster frame each',
            ],
            [
              'Day 2',
              'Tsahi',
              'Asset Library → Upload Creative Assets → Preview on iPhone, iPad, both orientations, Dark Mode → submit standalone',
              'Assets in review (no new build)',
            ],
            [
              'Day 3 to 5',
              'Apple',
              'Review against version 1.25',
              'Approved assets',
            ],
            [
              'Day 5',
              'Tsahi',
              'Product Page Optimization → Create Test "Header video Nov 2026" → 1 treatment, 50% traffic, English → treatment gets the header and search video → Start',
              'Test running',
            ],
            [
              'Day 5',
              'Tsahi',
              'Featuring nomination (App Enhancements) citing the iOS 27 assets and the 1.25 feed',
              'Nomination submitted',
            ],
            [
              'Day 5 to 35',
              'Nimrod, Smith',
              'Read the test weekly in App Analytics; re-pull the funnel with the new data layer',
              'Decision at 90% confidence',
            ],
            [
              'After',
              'Tsahi',
              'Apply the winner; swap in the headlines-ticker treatment (concept B) as the next test',
              'Live assets',
            ],
            [
              'After the screenshot test',
              'Tsahi, Smith',
              'Record the six preview scenes on a 6.9" iPhone over QuickTime; Smith captions, cuts to 22 s, adds a silent AAC track; new PPO test, preview vs none',
              'Preview live or dropped on evidence',
            ],
          ]}
        />
      </Case>
      <Case
        title="What Smith needs from this Storybook"
        note="Export at 2× or 4× device scale so the frames are already at Apple's pixel sizes."
      >
        <Bullets
          items={[
            'Header frames: stories 6, canvases header-0 to header-3, 1120 × 480 authored; export at 3.43× gives 3840 × 1646.',
            'Search frames: search-0 to search-3, 900 × 600 authored; export at 4.27× gives 3840 × 2560.',
            'The aurora behind the live screenshots (the hero illustration, blurred) replaces the gradient in the final render, so every store asset shares one background.',
            'The feed in the final render is the same data: the public feed as of the export day, so titles are current when the asset goes live.',
          ]}
        />
      </Case>
      <Case title="Test design">
        <Bullets
          items={[
            'One test at a time, one treatment, one variable: the header and search videos together, since they are one asset in two crops and the search slot cannot be tested alone.',
            'Baseline is the original page. Read impressions to page views first, then conversion. A treatment that gets more taps but fewer installs is attracting the wrong people and loses.',
            'Guardrail: day-7 retention of the treatment cohort, pulled from App Analytics by the PPO cohort, so a video that sells a different product shows up.',
            'Do not submit a new version that changes screenshots while the test runs; do submit the version after the test if the preview is added.',
            "Only iOS 27 users see the treatment's assets. If the duration estimate exceeds 90 days, raise traffic to 100% of the treatment share.",
          ]}
        />
      </Case>
      <Case title="Risks">
        <Bullets
          items={[
            'Reach: the header and search video only show on iOS 27. The share of our product page views on iOS 27 decides how fast the test converges; pull it from App Analytics by OS version before starting.',
            'Delivery bug: a forum thread reports iPhone previews not being served on some iOS 27 devices. Check the live page from a phone the day the assets go live.',
            'Stale content: the feed in the asset ages. Plan a quarterly re-render, which Asset Library swaps without a review of the app.',
            'Localization: the headline is English. Each localized storefront needs its own asset text once the listing is localized; keep the composition text-light for that reason.',
          ]}
        />
      </Case>
    </Page>
  ),
};
