import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { cardStory, Page, Section, stepStory, ViewportFrame } from './harness';

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
          ourselves. Both surfaces that ask the question get the variant: the
          signup funnel step and the feed card. All frames render the production
          components.
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
              'One line, placeholder “A friend, a video, Reddit…”. Autofocused in the funnel step, where it is the only control; never in the feed card.',
            ],
            [
              'Continue',
              'Off until there is a non-blank answer. Enter submits too. While saving the CTA shows its loader and the field locks.',
            ],
            [
              'Clear',
              'An x button appears once there is text, clears it and puts the cursor back.',
            ],
            [
              'Limit',
              '44 characters: the API keeps 50, shared with the other: prefix. The hint switches to “That’s the limit. We’ll get the gist.” instead of showing a counter.',
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
                until a funnel opts in). The feed card takes the same{' '}
                <code>answerStyle</code> prop; it needs a flag before it can be
                tested in the feed.
              </>,
            ],
          ]}
        />
      </Section>
      <Section title="Chapters">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
          <Chapter title="1. Onboarding step" story={stepStory('empty')}>
            Empty, filled, at the limit, only spaces, cleared, saving, Enter,
            failed save, explainer, skip, long headline, both chrome arms, the
            paid funnel and today’s list.
          </Chapter>
          <Chapter title="2. Feed card" story={cardStory('grid-empty')}>
            Grid and list cards in every state, inside a feed, and today’s radio
            list for comparison.
          </Chapter>
          <Chapter
            title="3. Breakpoints"
            story="features-onboarding-acquisition-open-field-3-breakpoints--breakpoints"
          >
            320px to 2560px, keyboard open, landscape, and the feed card at
            phone, tablet, laptop and desktop widths.
          </Chapter>
        </div>
      </Section>
      <Section title="Feed card">
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
          <ViewportFrame
            label="Phone: list card"
            storyId={cardStory('in-a-feed-filled')}
            width={390}
            height={600}
          />
          <ViewportFrame
            label="Laptop: grid card"
            storyId={cardStory('in-a-feed-filled')}
            width={1280}
            height={800}
          />
        </div>
      </Section>
    </Page>
  ),
};
