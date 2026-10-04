import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { BrowserChrome, Phone } from './kit';
import { FeedList, TodayChips, TodayLogoRow, TodayTabBar } from './mocks';
import { HomeScroll, PostScroll, SquadScroll } from './scrollPages';
import { OpenStill } from './browser';
import { posts } from './data';

// Chapter 9i: the steps, explained. No flag (Tsahi, 1 Oct 2026): each step
// goes live for everyone when it merges. The viewer below walks the five
// steps in order and shows what members have at each one.

// Today's Home, for the 0 position: the logo row, the chip strip, the feed
// and the docked footer, as production draws them.
const TodayHome = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <TodayLogoRow loggedIn />
      <TodayChips />
      <div className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-16">
        <FeedList items={[...posts, ...posts]} />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <TodayTabBar />
      </div>
    </div>
  </Phone>
);

export interface Phase {
  value: number;
  name: string;
  oneLine: string;
  memberSees: string;
  chapters: string;
  read: string;
  render: () => ReactElement;
}

export const phases: Phase[] = [
  {
    value: 0,
    name: 'Today, plus the fixes',
    oneLine: 'The app as it is. The swipe bug, pull to refresh, press states and the touch-blind menus are fixed, one PR each.',
    memberSees: 'The same app, a little less broken. Nothing looks different.',
    chapters: '1, 7',
    read: 'Gesture complaints; a baseline of taps on the bar.',
    render: () => <TodayHome />,
  },
  {
    value: 1,
    name: 'The shell',
    oneLine: 'The floating bar and the Create square, the header rows with the avatar and the You page, the leaf header that hides while reading, menus as sheets, back and history, the no-shell pages, the visitor header.',
    memberSees: 'A new bottom bar and a new top row on every page. This is the step members notice.',
    chapters: '3, 3b, 3d, 4, 4b, 4d, 4e, 5, 9b, 9c',
    read: 'Sessions that reach a second place; posts opened per session; day-7 return of phone-first members.',
    render: () => <HomeScroll />,
  },
  {
    value: 2,
    name: 'The places',
    oneLine: 'The tabs grammar and the nine duplicates removed, the Explore page, search everywhere with Spotlight, covers on squads and profiles with their segments, best-of in the sort menu, Agents and the other placed routes.',
    memberSees: 'Explore, Squads, tags, sources, squad and profile pages in their new form; search on every list.',
    chapters: '3c, 4c, 4, 9e',
    read: 'Searches per session; squad and Happening now views per member.',
    render: () => <SquadScroll />,
  },
  {
    value: 3,
    name: 'The post, and you',
    oneLine: 'The post page bar on the scroll progress and the composer for comments; the streak sheet and the milestone popup; Settings and the forms; the Activity settings glyph.',
    memberSees: 'A calmer post page, the new streak sheet, the settings pages and forms.',
    chapters: '6, 9d',
    read: 'Comment rate; settings reached; streak sheet opened.',
    render: () => <PostScroll />,
  },
  {
    value: 4,
    name: 'Reading the link, and the wrappers',
    oneLine: 'The reading drawer; the iOS screen and the Android sheet; the bridge (haptics, back, edge to edge, status bar); the solid material when the phone asks for reduced transparency.',
    memberSees: 'Read opens the article with the post folded into a drawer at the bottom. Needs new app releases.',
    chapters: '6b, 7, 8',
    read: 'Reads per post opened; time in the reading page; back-outs before reading.',
    render: () => <OpenStill />,
  },
];

// The step viewer: pick a step, see what has shipped and what a member sees.
export const PhaseDial = (): ReactElement => {
  const [value, setValue] = useState(1);
  const current = phases[value];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-text-tertiary typo-footnote">Step {value} of 4 has shipped</span>
        <div className="flex flex-wrap gap-2">
          {phases.map((phase) => (
            <button
              key={phase.value}
              type="button"
              onClick={() => setValue(phase.value)}
              className={classNames(
                'flex h-10 items-center gap-2 rounded-12 border px-3 font-bold typo-callout',
                phase.value === value
                  ? 'border-text-primary bg-text-primary text-surface-invert'
                  : phase.value < value
                    ? 'border-text-primary text-text-primary'
                    : 'border-border-subtlest-tertiary text-text-quaternary',
              )}
            >
              <span className="tabular-nums">{phase.value}</span>
              <span className="font-normal">{phase.name}</span>
            </button>
          ))}
        </div>
        <span className="text-text-tertiary typo-footnote">
          Filled is the step that just shipped; outlined is already live from before; gray is not built yet. There is no switch: a step is live for everyone the day it merges, and a problem is fixed forward or reverted by a PR.
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-8">
        {current.render()}
        <div className="flex max-w-[26rem] flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-text-quaternary typo-caption1">What ships in step {value}</span>
            <span className="typo-callout">{current.oneLine}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-text-quaternary typo-caption1">What a member sees</span>
            <span className="typo-callout">{current.memberSees}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-text-quaternary typo-caption1">Chapters</span>
            <span className="tabular-nums typo-callout">{current.chapters}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-text-quaternary typo-caption1">What we read before step {Math.min(4, value + 1)} starts</span>
            <span className="typo-callout">{current.read}</span>
          </div>
          {value > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-text-quaternary typo-caption1">Already live from before</span>
              <span className="typo-callout">{phases.slice(1, value).map((phase) => phase.name).join(', ') || 'Nothing yet'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface PhaseQuestion {
  question: string;
  plain: string;
  recommendation: string;
  why: string;
}

export const phaseQuestions: PhaseQuestion[] = [
  {
    question: '1 · Ship in steps, or all at once?',
    plain: 'Do members get the whole new phone app on one day, or in five steps a few weeks apart?',
    recommendation: 'Five steps.',
    why: 'Each step is read on its own numbers, and a problem in step 3 is one revert, not the whole redesign. One day means one giant PR nobody can review.',
  },
  {
    question: '2 · Is the order right?',
    plain: 'Fixes first, then the bar and header, then the pages, then the post and settings, then the article drawer with the app releases.',
    recommendation: 'Yes, this order.',
    why: 'Step 0 needs no design debate and gives numbers. Step 1 is what members notice, and everything after depends on it. Step 4 waits on the iOS and Android engineers, so it goes last.',
  },
  {
    question: '3 · No flag: what does that mean in practice?',
    plain: 'Decided on 1 Oct: nothing is hidden behind a switch. A step is live for everyone the day its PR merges and deploys, like the logged-out header was.',
    recommendation: 'Decided. One more thing follows from it: step 1 ships as one release, not as a trickle of half-shells.',
    why: 'Without a switch, a half-built shell would be live. So the bar, the header and the back rule land together in one PR train that merges the same day; the later steps are per page and can land one at a time.',
  },
  {
    question: '4 · When does the next step start?',
    plain: 'What has to be true before we start building and merging the next step.',
    recommendation: 'Decided by Tsahi: no time gate. One PR at a time: build it, review it, merge it, QA it; when it is right, the next one. As fast as that allows.',
    why: 'The numbers per step are still read, but they inform the next PR rather than hold it. The pace is set by review and QA, not by a calendar.',
  },
  {
    question: '5 · Who decides a step is done?',
    plain: 'Whether moving to the next step is a product call or an engineering call.',
    recommendation: 'Decided by Tsahi: he does, after QA of the merged PR. Engineering still reverts without asking when something is broken.',
    why: 'Starting the next PR is a product call. Reverting is a safety move and must never wait for a meeting.',
  },
];
