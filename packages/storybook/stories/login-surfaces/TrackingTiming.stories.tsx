import type { ReactElement, ReactNode } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ExtensionProviders, bootAsAnonymous } from '../extension/_providers';
import { bareStory } from './frames';
import type { DeviceStory } from './device';
import { devices, LiveFrame, onDevice } from './device';
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

// The production "How did you hear about us?" step, from its own story.
const ACQUISITION_STORY =
  'features-onboarding-acquisition-follow-up-1-flow--list';
const darkStory = (storyId: string): string => `${storyId}&globals=theme:dark`;

// Apple's prompt right after the user answers "How did you hear about us?",
// the moment its question ("which ad brought you here") is already on their
// mind. No screen of our own: the answer's Continue triggers it.
export const AfterAcquisition: DeviceStory = {
  name: 'iOS prompt after "How did you hear about us?"',
  globals: { theme: 'dark' },
  ...onDevice(devices.iphone, undefined, () => (
    <IOSTrackingAlert>
      <iframe
        className="block h-dvh w-full border-0"
        src={`iframe.html?id=${darkStory(ACQUISITION_STORY)}&viewMode=story`}
        title="How did you hear about us?"
      />
    </IOSTrackingAlert>
  )),
};

type Step = {
  title: string;
  note: ReactNode;
} & (
  | { storyId: string }
  | { externalStoryId: string }
  | { placeholder: string }
);

// A phone at iPhone 17's real viewport, scaled to the column.
const PhoneStep = (step: Step): ReactElement => (
  <figure className="flex w-48 shrink-0 flex-col gap-2">
    {'storyId' in step || 'externalStoryId' in step ? (
      <LiveFrame
        storyId={
          'storyId' in step
            ? bareStory(step.storyId)
            : darkStory(step.externalStoryId)
        }
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
          Decided Oct 26, 2026 · mock · iOS app · iPhone 17
        </p>
        <h1 className="font-bold typo-title1">When to ask for tracking</h1>
        <p className="text-text-secondary typo-callout">
          iOS shows the tracking prompt once per install, so the moment matters.
          Today the app asks on launch, over the signup screen. The chosen
          direction adds no screen: iOS asks right after the user answers the
          onboarding step &quot;How did you hear about us?&quot;, which is the
          same question the prompt asks. Not built yet.
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
        label="Chosen"
        tone="recommended"
        note="Sign up without the prompt in the way. In onboarding, the user tells us how they found daily.dev, and as they continue, iOS asks the same question about ads."
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
            title: '3. How did you hear about us?',
            note: 'The existing step. They pick an answer and continue.',
            externalStoryId: ACQUISITION_STORY,
          },
          {
            title: '4. iOS prompt',
            note: 'Right after their answer. Either choice moves on.',
            storyId: 'login-surfaces-tracking-prompt-timing--after-acquisition',
          },
          {
            title: '5. Rest of onboarding',
            note: 'Then their feed.',
            placeholder: 'Remaining steps, then the feed',
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
            Web app: when the user continues from &quot;How did you hear about
            us?&quot;, send that message, only inside the iOS app and only if
            iOS hasn&apos;t asked yet.
          </li>
          <li>
            Users who already answered that step skip it, so for them the web
            app sends the message when onboarding completes instead.
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
