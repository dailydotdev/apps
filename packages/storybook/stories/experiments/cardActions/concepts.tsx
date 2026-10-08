import React from 'react';
import classNames from 'classnames';
import type { Slots } from './swap';
import { Act, act } from './primitives';
import { TodayBigBar } from './todayBig';

/**
 * The bar's frame on every concept. Production's bar row is 36px (24px
 * buttons + `py-1.5`); 32px buttons with `py-0.5` keep that exact height, so
 * no card grows. Tap areas reach past the row without taking layout space.
 */
const barFrame = 'px-2 py-0.5';

export interface Concept {
  id: string;
  name: string;
  /** Who does this already. */
  seenAt: string;
  idea: string;
  why: string[];
  risks: string[];
  slots?: Slots;
}

export const TODAY_CONCEPT: Concept = {
  id: 'today',
  name: 'Today (production)',
  seenAt: 'daily.dev',
  idea: 'Six actions at 24px with 16px icons, spread with justify-between.',
  why: [],
  risks: [
    'Icons sit at a different x on every card, because each count has a different width.',
  ],
};

type Kind = Parameters<typeof act>[0];

/**
 * E's slots: bookmark joins Read post and ⋯ on hover, and the bar is five
 * identical flat buttons spread evenly, in the given order.
 */
const saveOnHover = (order: Kind[]): Slots => ({
  beforeOptions: ({ a }) => <Act reach="tall" {...act('bookmark', a)} />,
  bar: ({ a }) => (
    <div className={classNames('flex items-center justify-between', barFrame)}>
      {order.map((k) => (
        <Act key={k} reach="tall" {...act(k, a)} />
      ))}
    </div>
  ),
});

/** The shortlist, after review: T.1, C.3, E.1 and E.2. */
export const CONCEPTS: Concept[] = [
  {
    id: 'today-32',
    name: 'T.1 Today, one size up',
    seenAt: 'daily.dev before #6394',
    idea: 'Today’s bar exactly — same six actions, same order, same style and number format — with 32px buttons and 20px icons instead of 24px / 16px. Answers: does a tighter gap alone make room for the bigger size?',
    why: [
      'No new pattern to learn; the bar people know, at the size it had before August.',
    ],
    risks: [
      'Needs the most width of anything here — see where it overflows in Compare.',
    ],
    slots: { bar: (ctx) => <TodayBigBar {...ctx} /> },
  },
  {
    id: 'pills-flat-split',
    name: 'C.3 Flat, downvote on the right',
    seenAt: 'YouTube (quiet dislike), Bluesky',
    idea: 'Upvote, comments and impressions run flush on the left as flat buttons; downvote, bookmark and copy link sit together on the right, 4px apart.',
    why: [
      'The left run is only positive signals with counts; the right group is the quiet, count-free actions.',
      'Downvote away from upvote is a deliberate act, not a slip — the YouTube lesson that quieter dislikes reduce pile-ons.',
      'The 4px gaps let the three icons on the right breathe without drifting apart.',
    ],
    risks: [
      'Separating up from down breaks the familiar vote pair; may lower downvotes, which the feed uses as a signal.',
    ],
    slots: {
      bar: ({ a }) => (
        <div className={classNames('flex items-center', barFrame)}>
          <Act reach="tall" {...act('upvote', a)} className="!pl-1 !pr-1" />
          <Act reach="tall" {...act('comment', a)} className="!pl-1 !pr-1.5" />
          <Act reach="tall" {...act('stat', a)} className="!pl-1 !pr-1.5" />
          <div className="ml-auto flex items-center gap-1">
            <Act size={28} reach="tall" {...act('downvote', a)} />
            <Act size={28} reach="tall" {...act('bookmark', a)} />
            <Act size={28} reach="tall" {...act('copy', a)} />
          </div>
        </div>
      ),
    },
  },
  {
    id: 'save-corner',
    name: 'E.1 Save on hover, flat bar',
    seenAt: 'Pinterest, Dribbble, Bluesky',
    idea: 'The top-right corner is empty at rest. On hover it shows Read post, bookmark and ⋯ (⋯ in the corner, bookmark beside it). The bottom bar keeps today’s order without bookmark — upvote, comment, downvote, copy link, impressions — as five flat buttons, all the same style, spread with equal space between them.',
    why: [
      'Every button in the bar looks the same, so the row reads as one calm rhythm.',
      'Five actions leave room for 32px buttons, 20px icons and even spacing, even on the narrowest card.',
      'The card at rest is just content and a quiet bar; saving appears with the other card-level actions.',
    ],
    risks: [
      'Bookmark is hover-only on desktop (touch keeps it visible); check that saves hold up.',
    ],
    slots: saveOnHover(['upvote', 'comment', 'downvote', 'copy', 'stat']),
  },
  {
    id: 'save-corner-stat',
    name: 'E.2 Save on hover, counts first',
    seenAt: 'Pinterest, Dribbble, X',
    idea: 'Upvote, comment and impressions first — every button with a count — then downvote and copy link, the two without one. Bookmark joins Read post and ⋯ on hover, as in E.1.',
    why: [
      'The three counts read as one group on the left; the count-free actions close the row.',
      'Downvote away from upvote is a deliberate act, not a slip — the YouTube lesson that quieter dislikes reduce pile-ons.',
    ],
    risks: [
      'Separating up from down breaks the familiar vote pair; may lower downvotes, which the feed uses as a signal.',
      'Bookmark is hover-only on desktop (touch keeps it visible); check that saves hold up.',
    ],
    slots: saveOnHover(['upvote', 'comment', 'stat', 'downvote', 'copy']),
  },
];

export const ALL_CONCEPTS = [TODAY_CONCEPT, ...CONCEPTS];
export const conceptById = (id: string): Concept =>
  ALL_CONCEPTS.find((c) => c.id === id) ?? TODAY_CONCEPT;
