import type { ReactElement } from 'react';
import React from 'react';
import type { Device } from './shell';
import { DeviceFrame } from './shell';

// The Review page's moments and device setups. Every screen there is the live
// screen story at that device's real viewport, opened at its moment through
// `args`, so it can never drift from the component.

// `at` is when a screen arrives: a clock time for the timed intro, or what
// triggers it. `motion` is how it moves in and how long it holds. Both mirror
// the constants in FeedPatchy.tsx and the motion CSS in shell.tsx.
export const caseStates = [
  {
    file: '01-intro-ready',
    args: 'start:intro',
    label: 'Intro: “Ready to make it official?”',
    at: '0.25s',
    motion: 'Fades in 0.5s · holds 1.2s · fades out 0.5s',
  },
  {
    file: '02-intro-commit',
    args: 'start:intro',
    label: 'Intro: “Commit to learning…”',
    at: '2.5s',
    motion: 'Fades in 0.5s · holds 1.5s · fades out 0.5s',
  },
  {
    file: '03-intro-ask',
    args: 'start:intro',
    label: 'Intro: the ask with the bone',
    at: '5.0s',
    motion: 'Fades in 0.6s · holds 0.8s · glides up 0.9s',
  },
  {
    file: '04-ready',
    args: 'start:ready',
    label: 'Ready to drag',
    at: '6.4s → 7.3s',
    motion:
      'Line and bone glide up 0.9s · Patchy fades in 0.5s · no button yet',
  },
  {
    file: '05-idle-ghost',
    args: 'start:ready',
    label: 'Idle: ghost hint',
    at: 'After 0.2s untouched',
    motion: 'The bone dips toward Patchy and back, 1.6s, twice, then re-arms',
  },
  {
    file: '06-dragging',
    args: 'start:ready;pose:dragging',
    label: 'Dragging: “Bring it to me!”',
    at: 'On grab',
    motion: 'Bubble pops in 0.32s · the bone follows the finger',
  },
  {
    file: '07-almost-there',
    args: 'start:ready;pose:near',
    label: 'Near: “Almost there…”',
    at: 'Within 64px of Patchy',
    motion: 'Patchy leans in 0.5s',
  },
  {
    file: '08-drop-it',
    args: 'start:ready;pose:over',
    label: 'Over Patchy: “Drop it!”',
    at: 'Over Patchy',
    motion: 'A drop anywhere on him catches; elsewhere, the bone springs back',
  },
  {
    file: '09-fed-confetti',
    args: 'start:fed',
    label: 'Fed: confetti',
    at: 'On drop',
    motion:
      'Flash 0.1s in, frames swap at 0.18s · cross-fade 0.3s · confetti 1.2–1.8s',
  },
  {
    file: '10-fed-settled',
    args: 'start:fed',
    label: 'Fed: settled',
    at: 'Drop + 1.2–1.8s',
    motion: 'Confetti clears · the reminder takes over at drop + 1.9s',
  },
  {
    file: '11-reminder-0900',
    args: 'start:reminder',
    label: 'Reminder: 09:00',
    at: 'Drop + 1.9s',
    motion:
      'Line glides up and Patchy steps up together, 0.9s · then subtext, card rises 0.56s, the button fades in 0.6s',
  },
  {
    file: '12-reminder-evening',
    args: 'start:reminder;hour:17',
    label: 'Reminder: Evening, 17:00',
    at: 'On preset tap',
    motion: 'Ruler glides to the hour · digits roll 0.26s, once',
  },
  {
    file: '13-reminder-late-night',
    args: 'start:reminder;hour:23',
    label: 'Reminder: late night, 23:00',
    at: 'On scrub, tap or key',
    motion: 'The ruler stops at 23; the copy follows the hour',
  },
  {
    file: '14-reminder-set',
    args: 'start:set;now:8',
    label: 'Reminder set',
    at: 'On Allow, after “Remind me”',
    motion:
      'Card fades 0.3s · Patchy returns 0.9s · bubble at +0.45s · the feed at +3s',
  },
  {
    file: '15-reminder-skipped',
    args: 'start:skipped',
    label: 'Reminder skipped',
    at: 'On “I’ll do it later”',
    motion:
      'Card fades 0.3s · Patchy returns 0.9s · no bubble · the feed at +3s',
  },
];

/** The states captured on every device; the full flow is on the phone. */
export const keyStates = [
  '04-ready',
  '08-drop-it',
  '09-fed-confetti',
  '10-fed-settled',
  '11-reminder-0900',
  '12-reminder-evening',
  '14-reminder-set',
  '15-reminder-skipped',
];

export interface CaseConfig {
  id: string;
  device: string;
  size: string;
  theme: 'Dark' | 'Light';
  frame: Device;
  /** The native wrapper's status-bar and home-indicator insets. */
  hasAppInsets?: boolean;
  /** Portrait screens sit side by side; wide ones take more of the row. */
  isWide?: boolean;
  note: string;
  states: string[];
}

const allStates = caseStates.map(({ file }) => file);

export const caseConfigs: CaseConfig[] = [
  {
    id: 'phone-dark',
    device: 'Phone',
    size: '390 × 844',
    theme: 'Dark',
    frame: 'phone',
    note: 'The full flow, every state. A mobile browser: no wrapper insets.',
    states: allStates,
  },
  {
    id: 'phone-light',
    device: 'Phone',
    size: '390 × 844',
    theme: 'Light',
    frame: 'phone',
    note: 'Light theme: the gold sparks replace white confetti, which would vanish.',
    states: keyStates,
  },
  {
    id: 'small-phone-dark',
    device: 'Small phone',
    size: '375 × 667 (iPhone SE)',
    theme: 'Dark',
    frame: 'small',
    note: 'Under 800px tall, so the compact reminder: no subtext, a tighter card with the timezone link beside the time, and Patchy sized to the room left.',
    states: keyStates,
  },
  {
    id: 'iphone-app-dark',
    device: 'iPhone app',
    size: '390 × 844, 47px status bar, 34px home indicator',
    theme: 'Dark',
    frame: 'phone',
    hasAppInsets: true,
    note: 'The native wrapper: the page starts below the status bar and the CTA clears the home indicator. 797px of usable height, so the compact reminder. Insets simulated through the variables the wrapper sets.',
    states: keyStates,
  },
  {
    id: 'iphone-app-light',
    device: 'iPhone app',
    size: '390 × 844, 47px status bar, 34px home indicator',
    theme: 'Light',
    frame: 'phone',
    hasAppInsets: true,
    note: 'As above, light theme.',
    states: keyStates,
  },
  {
    id: 'ipad-dark',
    device: 'iPad',
    size: '820 × 1180',
    theme: 'Dark',
    frame: 'ipad',
    note: 'Tablet styles. The scene centres in the tall screen and keeps the phone’s spacing.',
    states: keyStates,
  },
  {
    id: 'ipad-light',
    device: 'iPad',
    size: '820 × 1180',
    theme: 'Light',
    frame: 'ipad',
    note: 'As above, light theme.',
    states: keyStates,
  },
  {
    id: 'ipad-landscape-dark',
    device: 'iPad landscape',
    size: '1180 × 820',
    theme: 'Dark',
    frame: 'ipadLandscape',
    isWide: true,
    note: 'Wider than 1020px, so production’s laptop styles apply: the wordmark joins the logo.',
    states: keyStates,
  },
  {
    id: 'web-dark',
    device: 'Web',
    size: '1440 × 900',
    theme: 'Dark',
    frame: 'web',
    isWide: true,
    note: 'Laptop styles: the wordmark, the larger top bar and skip, the centred 32rem column.',
    states: keyStates,
  },
  {
    id: 'web-light',
    device: 'Web',
    size: '1440 × 900',
    theme: 'Light',
    frame: 'web',
    isWide: true,
    note: 'As above, light theme.',
    states: keyStates,
  },
];

export const stateLabel = (file: string): string =>
  caseStates.find((state) => state.file === file)?.label ?? file;

export const stateArgs = (file: string): string =>
  caseStates.find((state) => state.file === file)?.args ?? '';

/** Consecutive moments one live screen covers, as it plays from one to the
 * next (the intro's three lines; the confetti and the settled pose). */
export const groupByScreen = (files: string[]): string[][] =>
  files.reduce<string[][]>((groups, file) => {
    const last = groups[groups.length - 1];
    if (last && stateArgs(last[0]) === stateArgs(file)) {
      last.push(file);
      return groups;
    }
    return [...groups, [file]];
  }, []);

/** One live screen for a moment on a device setup. */
export const LiveShot = ({
  config,
  files,
  caption,
}: {
  config: CaseConfig;
  /** The moments it covers; it opens at the first. */
  files: string[];
  caption: string;
}): ReactElement => (
  <div
    className={
      config.isWide
        ? 'w-[28rem] shrink-0'
        : 'w-[15rem] shrink-0 tablet:w-[16rem]'
    }
  >
    <DeviceFrame
      device={config.frame}
      storyId="pages-onboarding-feed-patchy--screen"
      theme={config.theme.toLowerCase()}
      label={caption}
      args={`${stateArgs(files[0])}${config.hasAppInsets ? ';insets:app' : ''}`}
    />
  </div>
);

export const configTitle = (config: CaseConfig): string =>
  `${config.device} · ${config.theme}`;
