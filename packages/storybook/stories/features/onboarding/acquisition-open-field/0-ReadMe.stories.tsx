import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section, stepStory, ViewportFrame } from './harness';

const meta: Meta = {
  title: 'Features/Onboarding/Acquisition open field/0. Read me',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
};

export default meta;

const Rows = ({ rows }: { rows: Array<[string, ReactNode]> }): ReactElement => (
  <dl className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 border border-border-subtlest-tertiary">
    {rows.map(([term, detail]) => (
      <div
        key={term}
        className="grid grid-cols-[minmax(0,1fr)] gap-1 p-4 tablet:grid-cols-[12rem_minmax(0,1fr)] tablet:gap-6"
      >
        <dt className="font-bold text-text-primary typo-callout">{term}</dt>
        <dd className="break-words text-text-secondary typo-callout">
          {detail}
        </dd>
      </div>
    ))}
  </dl>
);

const StoryLink = ({
  story,
  children,
}: {
  story: string;
  children: ReactNode;
}): ReactElement => (
  <a
    href={`?path=/story/${stepStory(story)}`}
    target="_top"
    className="text-text-link underline"
  >
    {children}
  </a>
);

const Checklist = ({
  items,
}: {
  items: Array<[ReactNode, string]>;
}): ReactElement => (
  <ul className="flex flex-col gap-2">
    {items.map(([text, story]) => (
      <li key={story} className="flex items-start gap-3 typo-callout">
        <span
          aria-hidden
          className="mt-1 size-4 shrink-0 rounded-4 border border-border-subtlest-secondary"
        />
        <span className="min-w-0 flex-1 text-text-secondary">
          {text} <StoryLink story={story}>See story</StoryLink>
        </span>
      </li>
    ))}
  </ul>
);

const code = (text: string): ReactElement => <code>{text}</code>;

export const ReadMe: StoryObj = {
  name: 'Read me',
  render: () => (
    <Page
      eyebrow="Onboarding experiment · signup onboarding step only"
      title="“How did you hear about us?” as an open field"
      intro={
        <>
          Instead of picking from a list of channels, people type where they
          heard about us in their own words. The list nudges answers toward
          whatever sits on top and hides channels we never thought to list; an
          open field gives us the real answer, at the cost of grouping it
          ourselves. This page is the spec: every rule below has a story, and
          every story renders the production step.
        </>
      }
    >
      <Section title="Control vs. open field">
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
          <ViewportFrame
            label="Control (flag off): channel list"
            storyId={stepStory('control-arm')}
            width={390}
            height={844}
          />
          <ViewportFrame
            label="Variant (flag on): open field"
            storyId={stepStory('filled')}
            width={390}
            height={844}
          />
        </div>
      </Section>

      <Section title="Experiment">
        <Rows
          rows={[
            [
              'Feature flag',
              <>
                {code('onboarding_acquisition_open_field')} (boolean,{' '}
                {code('featureOnboardingAcquisitionOpenField')} in{' '}
                {code('lib/featureManagement.ts')}). Defaults to {code('false')}
                , the control; GrowthBook ramps the variant.
              </>,
            ],
            [
              'Where',
              <>
                The acquisition step of the signup onboarding funnel only. The
                flag is evaluated only there ({code('shouldEvaluate')}), so the
                paid funnel and the feed acquisition card never enter the
                experiment and keep the list.
              </>,
            ],
            [
              'Code',
              <>
                {code('features/onboarding/steps/FunnelAcquisition.tsx')}: the{' '}
                {code('OpenAnswer')} field next to the existing{' '}
                {code('OtherDetail')}. Tests in{' '}
                {code('FunnelAcquisition.spec.tsx')}.
              </>,
            ],
            [
              'While the flag loads',
              'The step renders nothing until the flag settles, so a person only ever sees, and is logged in, one arm.',
            ],
            [
              'Saved as',
              <>
                {code('other:<answer>')} through the existing{' '}
                {code('AddUserAcquisitionChannel')} mutation, whitespace
                collapsed: the same shape the list’s “Other” row writes, so
                current reports keep grouping on the key. The funnel transition
                carries {code('acquisitionChannel: "other"')}.
              </>,
            ],
            [
              'Measure',
              'Answer rate (answered vs. skipped or dropped) per arm, and the share of free-text answers that can be grouped into a channel.',
            ],
          ]}
        />
      </Section>

      <Section title="Behavior (variant)">
        <Rows
          rows={[
            [
              'Field',
              'The design system text field: gray at rest, primary-color border while focused, unchanged once filled. No brand tint: purple in onboarding means “selected option”.',
            ],
            [
              'Copy',
              <>
                Headline from config (default “How did you hear about us?”).
                Placeholder “Type your answer”, never example channels, which
                steer answers. Hint below the field “A few words is enough.” The
                field’s accessible name is always “How did you hear about us?”.
              </>,
            ],
            [
              'Focus',
              'Focused on load with a mouse and keyboard. Not on touch devices: iOS ignores it and Android shows a focused field with no keyboard.',
            ],
            [
              'Continue',
              'Disabled until there is a non-blank answer, like every other funnel step. Enter (“Go” on phone keyboards) submits too. While saving the CTA shows its loader and the field locks.',
            ],
            [
              'Clear',
              'An × appears once there is text; it empties the field and keeps the cursor in it.',
            ],
            [
              'Limit',
              '44 characters: the API keeps 50, shared with the other: prefix. Like every limited field in the app, the field’s built-in counter shows the characters left on the right: 44 when empty, counting down to 0. Typing and pasting stop at 0.',
            ],
            [
              'Errors',
              'None shown. A failed save still completes the step: the answer is analytics, not something the funnel waits on.',
            ],
            [
              'Skip',
              'Unchanged: shown in the top bar when the step config has a skip label. A profile that already has a channel never sees the step.',
            ],
          ]}
        />
      </Section>

      <Section title="Acceptance checklist">
        <Checklist
          items={[
            ['Flag off shows today’s list, unchanged.', 'control-arm'],
            [
              'Paid funnel shows the list even with the flag on.',
              'paid-funnel',
            ],
            [
              'Flag on, desktop: the field is focused and Continue is disabled.',
              'empty',
            ],
            [
              'Touch devices: the field is not focused on load.',
              'touch-device',
            ],
            [
              'Typing enables Continue and shows ×; × clears and refocuses.',
              'cleared',
            ],
            ['Only spaces keep Continue disabled.', 'only-spaces'],
            [
              'The counter on the right starts at 44 and counts down to 0; typing and pasting stop there.',
              'pasted-over-limit',
            ],
            [
              'Continue saves other:<answer> and completes the step.',
              'submitted-with-continue',
            ],
            [
              'Enter submits, with whitespace collapsed.',
              'submitted-with-enter',
            ],
            ['Saving shows the CTA loader and locks the field.', 'saving'],
            ['A failed save still completes the step.', 'save-fails'],
            ['Skip moves on without saving.', 'skipped'],
            ['A profile with a channel skips the step.', 'already-answered'],
            [
              'Explainer, skip, headline and CTA from config all apply.',
              'custom-copy',
            ],
            [
              'Light and dark themes, both onboarding_chrome arms.',
              'light-theme',
            ],
          ]}
        />
      </Section>

      <Section title="Not in this experiment">
        <Rows
          rows={[
            [
              'Feed card',
              'The feed acquisition card keeps its list; the flag never evaluates there.',
            ],
            [
              'Classifying answers',
              'Free text needs grouping (“Google”, “google search” and “Google Ads” are one channel) before results are read. Plan it before reading the experiment.',
            ],
            [
              'API limit',
              'If the variant wins, raising the 50-character API limit in daily-api would stop longer answers from being cut.',
            ],
          ]}
        />
      </Section>

      <Section title="Chapters">
        <div className="flex flex-col gap-2 text-text-secondary typo-callout">
          <p>
            <StoryLink story="empty">1. Onboarding step</StoryLink>: every
            state, flow, config option, platform and the control.
          </p>
          <p>
            <a
              href="?path=/story/features-onboarding-acquisition-open-field-2-breakpoints--breakpoints"
              target="_top"
              className="text-text-link underline"
            >
              2. Breakpoints
            </a>
            : 320px to 2560px, with the keyboard open and in landscape.
          </p>
        </div>
      </Section>
    </Page>
  ),
};
