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

const Chapter = ({
  title,
  story,
  children,
}: {
  title: string;
  story: string;
  children: ReactNode;
}): ReactElement => (
  <a
    href={`?path=/story/${story}`}
    target="_top"
    className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 hover:bg-surface-hover"
  >
    <p className="font-bold text-text-primary typo-callout">{title}</p>
    <p className="text-text-secondary typo-footnote">{children}</p>
  </a>
);

export const ReadMe: StoryObj = {
  name: 'Read me',
  render: () => (
    <Page
      eyebrow="Acquisition · experiment idea"
      title="“How did you hear about us?” as an open field"
      intro={
        <>
          Instead of picking from a list of channels, people type where they
          heard about us in their own words. The list nudges answers toward
          whatever sits on top and hides channels we never thought to list; an
          open field gives us the real answer, at the cost of grouping it
          ourselves. The variant is for the signup onboarding step only. All
          frames render the production component.
        </>
      }
    >
      <Section title="Today vs. the open field">
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
          <ViewportFrame
            label="Today: channel list"
            storyId={stepStory('today')}
            width={390}
            height={844}
          />
          <ViewportFrame
            label="New: open field"
            storyId={stepStory('filled')}
            width={390}
            height={844}
          />
        </div>
      </Section>
      <Section title="How it behaves">
        <Rows
          rows={[
            [
              'Field',
              'The design system’s text field, so it looks and behaves like every other field in the app: gray at rest, a primary-color border while focused, no tint once filled. The question is the headline; the placeholder only says “Type your answer” and lists no channels, so it doesn’t steer the answer. The hint sits outside the field and stays visible while typing.',
            ],
            [
              'Focus',
              'Focused on load on desktop, where typing is the obvious next step. Not on phones: iOS ignores it and Android shows a focused field with no keyboard.',
            ],
            [
              'Continue',
              'Off until there is a non-blank answer, like every other step in the funnel. Enter (“Go” on phone keyboards) submits too. While saving the CTA shows its loader and the field locks.',
            ],
            [
              'Clear',
              'An x button appears once there is text, clears it and puts the cursor back.',
            ],
            [
              'Limit',
              '44 characters: the API keeps 50, shared with the other: prefix. The hint switches to “That’s the character limit.” instead of showing a counter.',
            ],
            [
              'Saved as',
              <>
                <code>other:&lt;answer&gt;</code> with whitespace collapsed, the
                same shape the list’s “Other” row writes today, so existing
                reports keep grouping on the key. A failed save never blocks the
                funnel.
              </>,
            ],
            [
              'Skip',
              'Unchanged: shown when the funnel step config has a skip label.',
            ],
            [
              'Turning it on',
              <>
                Funnel step config <code>answerStyle: &quot;open&quot;</code>{' '}
                (defaults to <code>&quot;list&quot;</code>, so nothing changes
                until a funnel opts in).
              </>,
            ],
          ]}
        />
      </Section>
      <Section title="Chapters">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
          <Chapter title="1. Onboarding step" story={stepStory('empty')}>
            Empty, filled, at the limit, only spaces, cleared, saving, Enter,
            failed save, explainer, skip, long headline, both chrome arms, the
            paid funnel and today’s list.
          </Chapter>
          <Chapter
            title="2. Breakpoints"
            story="features-onboarding-acquisition-open-field-2-breakpoints--breakpoints"
          >
            320px to 2560px, with the keyboard open and in landscape.
          </Chapter>
        </div>
      </Section>
    </Page>
  ),
};
