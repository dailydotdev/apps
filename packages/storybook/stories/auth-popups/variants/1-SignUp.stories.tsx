import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Capture,
  CompareTable,
  Labeled,
  LiveFrame,
  PHONE,
  PhoneRow,
  screen,
  Section,
  Variant,
} from '../kit';
import { cardRow, closeRow, footerRow, iconsRow, paddingRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/3. Variants/1. Sign up',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const lines: [string, string][] = [
  [
    'Header Sign up, Home tab, clickbait shield, My feed',
    'Sign up to get a feed built for you.',
  ],
  [
    'Follow a source or person, post author',
    'Sign up to follow and get their posts in your feed.',
  ],
  ['Bookmark', 'Sign up to save posts for later.'],
  [
    'Upvote, downvote, on posts and comments',
    'Sign up to vote on posts and comments.',
  ],
  ['Comment, new comment', 'Sign up to join the discussion.'],
  ['Join a Squad', 'Sign up to join this Squad.'],
  ['Create a Squad', 'Sign up to create a Squad.'],
  ['Create a post', 'Sign up to post to the community.'],
  [
    'Subscribe to a source or collection',
    'Sign up to get notified about new posts.',
  ],
  [
    'Report or hide a post, report a comment',
    'Sign up to hide and report content.',
  ],
  ['Tag filters, feed filters', 'Sign up to tune your feed.'],
  ['Plus, Ask, quests', 'Sign up to get daily.dev Plus.'],
  ['Give an award', 'Sign up to give awards.'],
  ['Notifications (Activity tab)', 'Sign up to see your notifications.'],
  [
    'Everything else: search, live chat, stack, marketplace, sidebar items, OAuth, organizations',
    'No line',
  ],
];

export const SignUp: StoryObj = {
  name: 'Sign up',
  render: () => (
    <Variant
      number={1}
      question="What every logged-out action opens"
      title="Sign up"
      goal={
        <p>
          The pop-up behind the header’s Sign up and every action a logged-out
          visitor tries. It’s the baseline every other variant follows.
        </p>
      }
      capture="webapp-signup"
      story={screen('sign-up')}
      captions={{
        phoneBefore: 'Opened from an upvote',
        desktopBefore: 'Opened from the header’s Sign up',
      }}
      changes={[
        closeRow,
        {
          aspect: 'Line under the title',
          cells: [
            'Phones only, worded per action: “Sign up to vote on posts and comments.”',
            'Removed. Every Sign up opens on the same headline, the landing page’s “Where developers discover what’s next.”, whatever opened it.',
          ],
        },
        {
          aspect: 'Email',
          cells: [
            '“or”, then an Email field with an arrow button, the legal line under it',
            'A “Continue with email” button with the providers, opening the email sign-up form (variant 5). No divider. The legal line sits under the five buttons, like the landing page.',
          ],
        },
        iconsRow,
        footerRow('“Already using daily.dev? Log in”'),
        paddingRow,
        cardRow,
      ]}
    >
      <Section
        title="Also on a phone"
        note="Google One Tap still shows on Sign up and Log in, where people choose how to sign in, and now closes once they pick email. On phones it covers the footer while open. Light theme follows the visitor’s setting."
      >
        <PhoneRow>
          <Labeled
            label="Before · with One Tap"
            tone="production"
            caption="Google One Tap slides over the bottom and hides the Log in line, in the visitor’s Google language."
          >
            <Capture
              name="webapp-signup-phone-onetap"
              alt="Google One Tap covering the bottom of the phone pop-up"
            />
          </Labeled>
          <Labeled label="After · light theme" tone="proposed">
            <LiveFrame
              storyId={screen('light-sign-up', undefined, 'light')}
              title="Sign-up pop-up on a phone in light theme, proposed"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>
      <Section
        title="Lines removed"
        note="23 actions shared 14 lines and the other 22 showed none."
      >
        <CompareTable
          firstColumn="Opened by"
          columns={['Line under “Sign up”']}
          rows={lines.map(([aspect, line]) => ({ aspect, cells: [line] }))}
        />
      </Section>
    </Variant>
  ),
};
