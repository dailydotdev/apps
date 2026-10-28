import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Case, Page } from './parts';

const meta: Meta = {
  title: 'Hero Cover/Final/7. Buttons in the app',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const base = '/images/home-buttons';

type Shot = { file: string; caption: string };

/* ------------------------------------------------------------------ */
/* The rules, as checked in the captures below                          */
/* ------------------------------------------------------------------ */

const checks: { rule: string; isMet: boolean; where: string }[] = [
  {
    rule: 'One filled button per screen: New post, or Done while editing.',
    isMet: true,
    where:
      'Every header capture. Get Plus is no longer a filled pink button; Done is the only filled one in edit mode.',
  },
  {
    rule: 'Every other control is the same Tertiary Small button (32px).',
    isMet: true,
    where:
      'Getting started, Get Plus, New widget, the shield, achievements, Shortcuts and Feed settings, 4px apart in the header. The New feed plus next to For you drops its fill under the rail. No Float backgrounds or 40px buttons are left.',
  },
  {
    rule: 'Color only in icons that carry meaning.',
    isMet: true,
    where:
      'Pink DevPlus icon on Get Plus, the green shield for Plus members, the red shield out of free tries (Laptop L, out of tries).',
  },
  {
    rule: 'Counts are the label: 2/6, 1/5, 3/10.',
    isMet: true,
    where:
      'Tracking captures show 3/10 instead of "3 of 10 posts upvoted". The sentence moves to the accessible name (covered by a spec).',
  },
  {
    rule: 'One attention dot for every control.',
    isMet: true,
    where:
      'The small purple dot on Getting started and on achievements replaces the "!" badge and the orange dot. Feed settings uses it for the tags reminder too (spec).',
  },
  {
    rule: 'Getting started uses the checklist icon everywhere (#7092).',
    isMet: true,
    where:
      'The header button and the Getting started widget in edit mode. It is the one change readers without the rail also see.',
  },
  {
    rule: 'All icons are outlined.',
    isMet: true,
    where: 'The achievement medal is the outlined MedalBadge.',
  },
  {
    rule: 'Tab row order: achievements, shield, Shortcuts, then Feed settings last.',
    isMet: true,
    where:
      'Every tab row capture; Shortcuts shows in the extension captures, where it lives.',
  },
  {
    rule: 'Readers without the rail see exactly today’s UI.',
    isMet: true,
    where:
      'Flag-off captures: the action strip differs only by the 22px Getting started icon (#7092). The cards below are the live feed and its rotating ad.',
  },
];

/* ------------------------------------------------------------------ */
/* Captures                                                             */
/* ------------------------------------------------------------------ */

const sizes: {
  name: string;
  width: number;
  note: string;
  states: Shot[];
}[] = [
  {
    name: 'Phone',
    width: 375,
    note: 'The greeting and the gear only, as today. Edit mode shows New widget as Tertiary next to Done; Sort and Feed settings live in the For you sheet.',
    states: [
      { file: 'default', caption: 'New reader, quests left' },
      { file: 'tracking', caption: 'Tracking an achievement' },
      { file: 'edit', caption: 'Editing the rail' },
      { file: 'plus', caption: 'Plus member' },
      { file: 'sheet', caption: 'The For you sheet' },
    ],
  },
  {
    name: 'Tablet',
    width: 768,
    note: 'Get Plus, New post and Feed settings are icons; no bell, the sidebar has notifications. The tab row keeps the streak, now Tertiary Small, with Feed settings last.',
    states: [
      { file: 'default', caption: 'New reader, quests left' },
      { file: 'tracking', caption: 'Tracking an achievement' },
      { file: 'edit', caption: 'Editing the rail' },
      { file: 'plus', caption: 'Plus member, shield on' },
      { file: 'notries', caption: 'Out of free shield tries' },
    ],
  },
  {
    name: 'Laptop',
    width: 1020,
    note: 'Labels for Get Plus, New post and Feed settings come back; Getting started keeps the short count. The New feed plus next to For you has no fill.',
    states: [
      { file: 'default', caption: 'New reader, quests left' },
      { file: 'tracking', caption: 'Tracking an achievement' },
      { file: 'edit', caption: 'Editing the rail' },
      { file: 'plus', caption: 'Plus member, shield on' },
    ],
  },
  {
    name: 'Laptop L',
    width: 1360,
    note: 'The size most readers see.',
    states: [
      { file: 'default', caption: 'New reader, quests left' },
      { file: 'tracking', caption: 'Tracking an achievement' },
      { file: 'edit', caption: 'Editing the rail' },
      { file: 'plus', caption: 'Plus member, shield on' },
      { file: 'notries', caption: 'Out of free shield tries' },
    ],
  },
  {
    name: 'Laptop XL',
    width: 1668,
    note: 'Getting started shows its name beside the count.',
    states: [
      { file: 'default', caption: 'New reader, quests left' },
      { file: 'tracking', caption: 'Tracking an achievement' },
      { file: 'edit', caption: 'Editing the rail' },
      { file: 'plus', caption: 'Plus member, shield on' },
    ],
  },
  {
    name: 'Desktop',
    width: 1976,
    note: 'Four rail columns; the same two styles.',
    states: [
      { file: 'default', caption: 'New reader, quests left' },
      { file: 'tracking', caption: 'Tracking an achievement' },
      { file: 'edit', caption: 'Editing the rail' },
      { file: 'plus', caption: 'Plus member, shield on' },
    ],
  },
];

const nativeShots: Shot[] = [
  { file: 'app390-ios', caption: 'iOS app, iPhone (390)' },
  { file: 'app390-android', caption: 'Android app, phone (390)' },
  { file: 'app820-ios', caption: 'iOS app, iPad (820)' },
  { file: 'app820-android', caption: 'Android app, tablet (820)' },
];

const extensionShots: Shot[] = [
  {
    file: '1020-ext-shortcuts',
    caption: 'Laptop (1020), shortcuts row hidden',
  },
  {
    file: '1360-ext-shortcuts',
    caption: 'Laptop L (1360), shortcuts row hidden',
  },
  { file: '1360-ext-tracking', caption: 'Laptop L (1360), the busiest row' },
  { file: '1976-ext-tracking', caption: 'Desktop (1976), the busiest row' },
];

const flagOffShots: Shot[] = [375, 768, 1020, 1360, 1668, 1976].map(
  (width) => ({ file: `${width}-flagoff`, caption: `${width}px` }),
);

/* ------------------------------------------------------------------ */
/* Layout                                                               */
/* ------------------------------------------------------------------ */

const Capture = ({
  file,
  label,
  isAfter,
}: {
  file: string;
  label: string;
  isAfter?: boolean;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption
      className={classNames(
        'font-bold typo-footnote',
        isAfter ? 'text-text-primary' : 'text-text-tertiary',
      )}
    >
      {label}
    </figcaption>
    <a href={`${base}/${file}.png`} target="_blank" rel="noreferrer">
      <img
        src={`${base}/${file}.png`}
        alt={label}
        loading="lazy"
        className="w-full rounded-12 border border-border-subtlest-tertiary"
      />
    </a>
  </figure>
);

type PairLayout = 'phone' | 'tablet' | 'wide';

// Wide captures stack so the 32px buttons show close to their real size.
const pairLayoutClassName: Record<PairLayout, string> = {
  phone: 'grid-cols-2 laptop:max-w-[48rem]',
  tablet: 'grid-cols-1 laptop:grid-cols-2',
  wide: 'grid-cols-1',
};

const layoutFor = (width: number): PairLayout => {
  if (width < 656) {
    return 'phone';
  }
  return width < 1020 ? 'tablet' : 'wide';
};

const Pair = ({
  file,
  caption,
  layout,
}: Shot & { layout: PairLayout }): ReactElement => (
  <div className="flex flex-col gap-3">
    <h3 className="font-bold text-text-secondary typo-callout">{caption}</h3>
    <div className={classNames('grid gap-4', pairLayoutClassName[layout])}>
      <Capture file={`${file}-before`} label="Before · main" />
      <Capture file={`${file}-after`} label="After · option A" isAfter />
    </div>
  </div>
);

const Pairs = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-col gap-10">{children}</div>
);

export const ButtonsInApp: StoryObj = {
  name: '7. Buttons in the app',
  render: () => (
    <Page
      chapter="Final · 7"
      question="Does the shipped build match option A?"
      title="Buttons in the app"
      goal="Check the execution of 6. Buttons in the real webapp, extension and app shells, at every screen size and state, before against after."
      metric="Every rule checked below, and readers without the rail see no change but the Getting started icon."
    >
      <Case
        title="The rules, checked"
        note="Captured from the local webapp against production content (api.daily.dev through a proxy that turns the rail flags on and signs in a fake new reader with 2 of 6 intro quests done and 1 of 5 free shield tries left). Click any capture to open it full size."
      >
        <ul className="flex max-w-[60rem] flex-col gap-3">
          {checks.map(({ rule, isMet, where }) => (
            <li key={rule} className="flex gap-3">
              <span
                aria-label={isMet ? 'Met' : 'Not met'}
                className={classNames(
                  'w-5 shrink-0 font-bold typo-callout',
                  isMet ? 'text-status-success' : 'text-status-error',
                )}
              >
                {isMet ? '✓' : '✗'}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-text-primary typo-callout">{rule}</span>
                <span className="text-text-tertiary typo-footnote">
                  {where}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Case>

      {sizes.map(({ name, width, note, states }) => (
        <Case key={name} title={`${name} · ${width}px`} note={note}>
          <Pairs>
            {states.map(({ file, caption }) => (
              <Pair
                key={file}
                file={`${width}-${file}`}
                caption={caption}
                layout={layoutFor(width)}
              />
            ))}
          </Pairs>
        </Case>
      ))}

      <Case
        title="Native apps"
        note="The iOS and Android apps run the webapp shell. Emulated the way getDailyClientPlatform reads them: the iOS message handlers and the ios class, and ?android=true. Phones keep the greeting and the gear; tablets get the tablet row."
      >
        <Pairs>
          {nativeShots.map(({ file, caption }) => (
            <Pair
              key={file}
              file={file}
              caption={caption}
              layout={file.startsWith('app390') ? 'phone' : 'tablet'}
            />
          ))}
        </Pairs>
      </Case>

      <Case
        title="Extension new tab"
        note="A development build of the extension against the same proxy, with the shortcuts row hidden so the Shortcuts toggle shows. It now sits before Feed settings."
      >
        <Pairs>
          {extensionShots.map(({ file, caption }) => (
            <Pair key={file} file={file} caption={caption} layout="wide" />
          ))}
        </Pairs>
      </Case>

      <Case
        title="Without the rail"
        note="feed_widgets off: SearchControlHeader and its shared controls are untouched. Pixel diff of the action strip: only the Getting started icon (Tour to checklist, #7092) changes. The cards below are the live feed, so the ad rotates between captures."
      >
        <Pairs>
          {flagOffShots.map(({ file, caption }) => (
            <Pair
              key={file}
              file={file}
              caption={caption}
              layout={layoutFor(Number(caption.replace('px', '')))}
            />
          ))}
        </Pairs>
      </Case>
    </Page>
  ),
};
