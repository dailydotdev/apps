import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CompareTable,
  Labeled,
  LiveFrame,
  Page,
  PHONE,
  PhoneRow,
  screen,
  Section,
} from './kit';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Phone context lines',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const samples = [
  ['MainButton', 'Header Sign up, Home tab'],
  ['Bookmark', 'Bookmark a post'],
  ['Comment', 'Comment on a post'],
  ['JoinSquad', 'Join a Squad'],
];

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

export const ContextLines: StoryObj = {
  name: 'Phone context lines',
  render: () => (
    <Page
      eyebrow="Chapter 5 · Does the pop-up change with what opened it?"
      title="The phone-only context line"
      goal={
        <>
          <p>
            <strong>Goal:</strong> list the one part of the pop-up that changes
            per action. On phones, in Sign up only, a line under the header says
            what signing up gets. Desktop, Log in, Welcome back and the landing
            page never show it.
          </p>
          <p className="mt-2">
            The Login Surfaces review in #7046 already proposed dropping it, so
            the phone matches desktop and every pop-up opens the same way.
          </p>
        </>
      }
    >
      <Section title="Four actions, live">
        <PhoneRow>
          {samples.map(([key, label]) => (
            <Labeled key={key} label={`Live · ${label}`} tone="live">
              <LiveFrame
                storyId={screen('sign-up', `triggerKey:${key}`)}
                title={`Sign-up pop-up opened by ${label}`}
                {...PHONE}
              />
            </Labeled>
          ))}
        </PhoneRow>
      </Section>

      <Section
        title="Every line"
        note="From authContextLines.ts: 23 actions share 14 lines, and the other 22 show none."
      >
        <CompareTable
          firstColumn="Opened by"
          columns={['Line under “Sign up”']}
          rows={lines.map(([aspect, line]) => ({ aspect, cells: [line] }))}
        />
      </Section>
    </Page>
  ),
};
