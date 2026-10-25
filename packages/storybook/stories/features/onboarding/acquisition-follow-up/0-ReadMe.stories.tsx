import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { flowStory, Page, Section, ViewportFrame } from './harness';

const meta: Meta = {
  title: 'Features/Onboarding/Acquisition follow-up/0. Read me',
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
    href={`?path=/story/${flowStory(story)}`}
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
      title="“How did you hear about us?” with a follow-up for Search and AI"
      intro={
        <>
          The open-field experiment lost: free text gave worse channel data than
          the list (63% vs 76% usable) and dropped the long tail. Its one win
          was detail inside a channel, such as which AI tool. This keeps the
          list for everyone and asks a short follow-up only after{' '}
          <strong>Search engine</strong> (what did you search for?) or{' '}
          <strong>AI assistant</strong> (what did you ask the AI?), on one page
          that looks the same for both except the headline. Even a small share
          of answers tells us which searches and prompts lead developers to
          daily.dev. This page is the spec: every rule below has a story, and
          every story renders the production step.
        </>
      }
    >
      <Section title="The flow">
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
          <ViewportFrame
            label="1. The list, unchanged"
            storyId={flowStory('list-search-picked')}
            width={390}
            height={844}
          />
          <ViewportFrame
            label="2a. After Search engine"
            storyId={flowStory('search-filled')}
            width={390}
            height={844}
          />
          <ViewportFrame
            label="2b. After AI assistant"
            storyId={flowStory('ai-filled')}
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
                {code('onboarding_acquisition_follow_up')} (boolean,{' '}
                {code('featureOnboardingAcquisitionFollowUp')} in{' '}
                {code('lib/featureManagement.ts')}). Defaults to {code('false')}
                , the control; GrowthBook ramps the variant. It replaces{' '}
                {code('onboarding_acquisition_open_field')}, whose code this PR
                removes.
              </>,
            ],
            [
              'Where',
              <>
                The acquisition step of the signup onboarding funnel only. The
                flag is evaluated only there ({code('shouldEvaluate')}); the
                paid funnel and the feed card never get the follow-up.
              </>,
            ],
            [
              'Who sees it',
              'Everyone in the experiment sees the same list. Only people who pick Search engine or AI assistant, in the variant, get the second screen. Every other pick finishes at the list.',
            ],
            [
              'Code',
              <>
                {code('features/onboarding/steps/FunnelAcquisition.tsx')}: the{' '}
                {code('AcquisitionFollowUp')} screen inside the step, no new
                funnel step or backend config. Tests in{' '}
                {code('FunnelAcquisition.spec.tsx')}.
              </>,
            ],
            [
              'Measure',
              'Answer rate on the follow-up (answered vs. skipped), onboarding completion vs. control as the guardrail, and what people search for and prompt.',
            ],
          ]}
        />
      </Section>

      <Section title="What gets saved">
        <Rows
          rows={[
            [
              'Field',
              <>
                The profile’s {code('acquisitionChannel')} through the existing{' '}
                {code('AddUserAcquisitionChannel')} mutation, capped at 120
                characters by the API, which simply overwrites the value.
              </>,
            ],
            [
              'When',
              'Once per step, when it completes: the answer on Continue, or the plain channel on Skip. Leaving on the follow-up page saves nothing, the same as leaving the list today. Repeat clicks while saving are ignored, so the step can’t complete twice.',
            ],
            [
              'Search',
              <>
                {code('search_engine:<query>')}, e.g.{' '}
                {code('search_engine:daily dev news')}.
              </>,
            ],
            [
              'AI',
              <>
                {code('ai:<prompt>')}, e.g.{' '}
                {code('ai:best app for developer news')}.
              </>,
            ],
            [
              'Whitespace',
              'Collapsed before saving, so the cap counts characters people can see.',
            ],
            [
              'Funnel',
              <>
                The transition carries the plain channel (
                {code('acquisitionChannel: "search_engine"')} or {code('"ai"')}
                ), and the existing Submit event fires once with it, as today.
              </>,
            ],
          ]}
        />
      </Section>

      <Section title="Behavior (follow-up screen)">
        <Rows
          rows={[
            [
              'Copy',
              <>
                The same page for both picks: only the headline changes, “What
                did you search for?” or “What did you ask the AI?”. Placeholder
                “Type your answer”, hint “Your best guess is fine.” No example
                searches or prompts, which steer answers.
              </>,
            ],
            [
              'Field',
              'One design system text field and nothing else, with its built-in counter on the right counting down from 100 to 0, for both search and AI.',
            ],
            [
              'Continue',
              'Disabled until there is a non-blank answer. Enter (“Go” on phones) submits. While saving the CTA shows its loader and the field locks.',
            ],
            [
              'Back and Skip',
              'Always in the top bar. Back returns to the list with the pick kept. Skip saves the plain channel and completes the step. Both are inactive while saving.',
            ],
            [
              'Focus',
              'The field is focused on load with a mouse and keyboard, never on touch devices.',
            ],
            [
              'Errors',
              'None shown. A failed save still completes the step: the answer is analytics, not something the funnel waits on.',
            ],
          ]}
        />
      </Section>

      <Section title="Acceptance checklist">
        <Checklist
          items={[
            ['Both arms see today’s list unchanged.', 'list'],
            ['Flag off: Search engine finishes at the list.', 'control-arm'],
            ['Paid funnel: no follow-up even with the flag on.', 'paid-funnel'],
            ['Other picks finish at the list in the variant.', 'other-channel'],
            [
              'Search engine opens “What did you search for?”, focused on desktop, Continue disabled.',
              'search-empty',
            ],
            [
              'Touch devices: the follow-up field is not focused on load.',
              'touch-device',
            ],
            ['The counter starts at 100 and stops at 0.', 'search-at-limit'],
            [
              'Submitting saves search_engine:<answer> once and completes.',
              'search-submitted',
            ],
            [
              'AI assistant opens the same page with “What did you ask the AI?”.',
              'ai-empty',
            ],
            ['AI saves ai:<prompt>.', 'ai-submitted'],
            ['Skip saves the plain channel and completes.', 'skipped'],
            ['Back returns to the list with the pick kept.', 'back-to-list'],
            ['Saving shows the loader and locks the field.', 'saving'],
            ['A failed save still completes the step.', 'save-fails'],
            [
              'Light and dark themes, both onboarding_chrome arms.',
              'light-theme',
            ],
          ]}
        />
      </Section>

      <Section title="Chapters">
        <div className="flex flex-col gap-2 text-text-secondary typo-callout">
          <p>
            <StoryLink story="search-empty">1. Flow</StoryLink>: the list, both
            follow-ups, back, skip, saving, platform and the control.
          </p>
          <p>
            <a
              href="?path=/story/features-onboarding-acquisition-follow-up-2-breakpoints--breakpoints"
              target="_top"
              className="text-text-link underline"
            >
              2. Breakpoints
            </a>
            : both follow-ups from 320px to 2560px, with the keyboard open and
            in landscape.
          </p>
        </div>
      </Section>
    </Page>
  ),
};
