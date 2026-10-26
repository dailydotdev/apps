import type { ReactElement, ReactNode } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ExtensionProviders, bootAsAnonymous } from '../extension/_providers';
import { DesktopFrame } from '../onboarding-fixes/kit';
import { bareStory } from './frames';
import type { DeviceStory } from './device';
import { devices, onDevice } from './device';
import { IOSTrackingAlert } from './iosSystem';

const meta: Meta = {
  title: 'Login Surfaces/Tracking prompt timing',
  parameters: { layout: 'fullscreen' },
  beforeEach: bootAsAnonymous,
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

// Our own screen right before the iOS prompt, after onboarding and before the
// feed. Apple allows it as long as it doesn't look like the system alert,
// offers nothing for allowing, and leads into the prompt either way, so it
// has one button.
const SoftAsk = (): ReactElement => (
  <div className="relative isolate flex min-h-dvh w-full flex-col justify-end overflow-hidden bg-background-default px-6 pb-10 text-text-primary">
    <img
      alt=""
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-1 size-full select-none object-cover"
      src="/images/login-surfaces/ios-splash-landing-art-stars.jpg"
      style={{ objectPosition: '50% 100%' }}
    />
    <div className="absolute inset-x-0 bottom-0 -z-1 h-3/5 bg-gradient-to-t from-background-default via-background-default to-transparent" />
    <div className="flex flex-col gap-4">
      <img
        alt="daily.dev"
        className="size-14 rounded-14 shadow-2"
        src="/images/login-surfaces/app-icon.png"
      />
      <h1 className="text-balance font-bold tracking-tight typo-title1">
        One quick question from iOS
      </h1>
      <p className="text-text-secondary typo-body">
        Next, iOS asks if daily.dev can see which ad brought you here. It helps
        us reach more developers like you. Either answer is fine, and you can
        change it anytime in Settings.
      </p>
      <Button
        className="mt-4 w-full"
        onClick={fn()}
        size={ButtonSize.Large}
        type="button"
        variant={ButtonVariant.Primary}
      >
        Continue
      </Button>
    </div>
  </div>
);

export const SoftAskScreen: DeviceStory = {
  name: 'Soft ask',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, undefined, () => <SoftAsk />),
};

export const SoftAskThenPrompt: DeviceStory = {
  name: 'Soft ask → iOS prompt',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, undefined, () => (
    <IOSTrackingAlert>
      <SoftAsk />
    </IOSTrackingAlert>
  )),
};

type Step = {
  title: string;
  note: ReactNode;
} & ({ storyId: string } | { placeholder: string });

// A phone at iPhone 17's real viewport, scaled to the column.
const PhoneStep = (step: Step): ReactElement => (
  <figure className="flex w-48 shrink-0 flex-col gap-2">
    {'storyId' in step ? (
      <DesktopFrame
        storyId={bareStory(step.storyId)}
        title={step.title}
        width={devices.iphone.width}
        height={devices.iphone.height}
      />
    ) : (
      <div
        className="flex items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary bg-surface-float p-4 text-center text-text-tertiary typo-footnote"
        style={{
          aspectRatio: `${devices.iphone.width} / ${devices.iphone.height}`,
        }}
      >
        {step.placeholder}
      </div>
    )}
    <figcaption className="flex flex-col gap-0.5">
      <span className="font-bold typo-callout">{step.title}</span>
      <span className="text-text-tertiary typo-footnote">{step.note}</span>
    </figcaption>
  </figure>
);

const Flow = ({
  label,
  tone,
  note,
  steps,
}: {
  label: string;
  tone: 'today' | 'recommended';
  note: string;
  steps: Step[];
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-3">
      <span
        className={classNames(
          'self-start rounded-8 px-2 py-0.5 font-bold text-white typo-caption1',
          tone === 'today'
            ? 'bg-accent-ketchup-default'
            : 'bg-accent-avocado-default',
        )}
      >
        {label}
      </span>
      <p className="max-w-[48rem] text-text-tertiary typo-callout">{note}</p>
    </div>
    <ol className="flex items-start gap-3 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <Fragment key={step.title}>
          {index > 0 && (
            <li aria-hidden className="mt-48 shrink-0 text-text-quaternary">
              <ArrowIcon className="rotate-90" />
            </li>
          )}
          <li>
            <PhoneStep {...step} />
          </li>
        </Fragment>
      ))}
    </ol>
  </section>
);

const Timing = (): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-12">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          Mock · iOS app · iPhone 17
        </p>
        <h1 className="font-bold typo-title1">When to ask for tracking</h1>
        <p className="text-text-secondary typo-callout">
          iOS shows the tracking prompt once per install, so the moment matters.
          Today the app asks on launch, over the signup screen. The
          recommendation is to ask once onboarding is done, after a short screen
          of our own that explains why.
        </p>
      </header>

      <Flow
        label="Today"
        tone="today"
        note="The app asks about 1.8 seconds after the first page loads, before the user has seen anything of daily.dev."
        steps={[
          {
            title: '1. Launch',
            note: 'The iOS prompt over the signup screen.',
            storyId: 'login-surfaces-aligned-signup--ios-tracking',
          },
          {
            title: '2. Sign up',
            note: 'Google, Apple or email.',
            storyId: 'login-surfaces-aligned-signup--ios',
          },
          {
            title: '3. Onboarding',
            note: 'Unchanged.',
            placeholder: 'Onboarding steps',
          },
          {
            title: '4. Feed',
            note: 'Their personalized feed.',
            placeholder: 'Feed',
          },
        ]}
      />

      <Flow
        label="Recommended"
        tone="recommended"
        note="Sign up without the prompt in the way. Once onboarding completes, one screen explains why, then iOS asks, then the feed."
        steps={[
          {
            title: '1. Sign up',
            note: 'No prompt on top.',
            storyId: 'login-surfaces-aligned-signup--ios',
          },
          {
            title: '2. Onboarding',
            note: 'Unchanged.',
            placeholder: 'Onboarding steps',
          },
          {
            title: '3. Soft ask',
            note: 'Our screen, one Continue button.',
            storyId: 'login-surfaces-tracking-prompt-timing--soft-ask-screen',
          },
          {
            title: '4. iOS prompt',
            note: 'Apple’s alert, either answer moves on.',
            storyId:
              'login-surfaces-tracking-prompt-timing--soft-ask-then-prompt',
          },
          {
            title: '5. Feed',
            note: 'Their personalized feed.',
            placeholder: 'Feed',
          },
        ]}
      />

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          What it takes
        </h2>
        <ul className="flex max-w-[50rem] list-disc flex-col gap-2 pl-6 text-text-secondary typo-callout">
          <li>
            iOS app: stop asking after the first page load (
            <code className="font-mono typo-footnote">
              ViewController.swift
            </code>
            ), and ask when the web app sends a new message instead. Ships with
            an App Store release.
          </li>
          <li>
            Web app: show the soft ask once onboarding completes, only inside
            the iOS app and only if iOS hasn&apos;t asked yet, then send that
            message on Continue.
          </li>
          <li>
            Users who skip onboarding or close the app before it ends get the
            soft ask on their next launch.
          </li>
          <li>
            Measure the share who allow tracking and how many signups get
            credited to ad campaigns, against today&apos;s timing.
          </li>
        </ul>
      </section>
    </div>
  </div>
);

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <Timing />,
};
