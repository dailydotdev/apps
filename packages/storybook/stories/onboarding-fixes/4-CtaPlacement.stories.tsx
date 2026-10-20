import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import classNames from 'classnames';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { FunnelStepCtaWrapper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { StepHeadline } from '@dailydotdev/shared/src/features/onboarding/shared/StepHeadline';
import { DesktopFrame, Labeled, Page, PhoneFrame, Section } from './kit';

type Mode = 'today' | 'follow';

interface Args {
  mode: Mode;
}

const meta: Meta<Args> = {
  title: 'Onboarding Fixes/4. CTA placement',
  parameters: { layout: 'fullscreen', themes: { themeOverride: 'dark' } },
  args: { mode: 'follow' },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['today', 'follow'],
      labels: {
        today: 'Today: pinned to the bottom',
        follow: 'New: follows the content from tablet up',
      },
    },
  },
};

export default meta;

const ID = 'onboarding-fixes-4-cta-placement';

export const Overview: StoryObj<Args> = {
  name: 'Read me',
  parameters: { controls: { disable: true } },
  render: () => (
    <Page
      eyebrow="Main CTA"
      title="The CTA follows the content, sticky only when it must"
      intro={
        <>
          From tablet up the bar sits right under the step&apos;s content and
          moves down as the content grows. Once the content is taller than the
          screen it sticks to the bottom, exactly as today. Phones keep the bar
          pinned to the bottom, by the thumb. All frames use the real step
          wrapper; desktop frames are 1280×800.
        </>
      }
    >
      {frames.map((frame) => (
        <Compare key={frame.id} {...frame} />
      ))}
    </Page>
  ),
};

// "Today" is the wrapper's pinned opt-out, which keeps the old behavior.

const TAGS = [
  'javascript',
  'react',
  'typescript',
  'nodejs',
  'python',
  'devops',
  'ai',
  'webdev',
  'rust',
  'golang',
  'docker',
  'kubernetes',
  'aws',
  'security',
  'css',
  'nextjs',
  'database',
  'linux',
];

const Step = ({
  mode,
  headline,
  description,
  children,
}: {
  mode: Mode;
  headline: string;
  description: string;
  children: ReactElement;
}): ReactElement => (
  <FunnelProgressContext.Provider
    value={{
      chapters: [{ steps: 6 }],
      position: { chapter: 0, step: 2 },
      isOnboarding: true,
    }}
  >
    <div className="flex min-h-dvh flex-col bg-background-default text-text-primary">
      <FunnelStepCtaWrapper
        isGlass
        onClick={fn()}
        isCtaPinned={mode === 'today'}
        containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
      >
        <div className="mx-auto flex w-full max-w-[32rem] flex-col gap-6 px-6 pt-3">
          <StepHeadline heading={headline} description={description} />
          {children}
        </div>
      </FunnelStepCtaWrapper>
    </div>
  </FunnelProgressContext.Provider>
);

const Rows = ({ count }: { count: number }): ReactElement => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: count }, (_, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="h-12 rounded-12 border border-border-subtlest-tertiary bg-surface-float"
      />
    ))}
  </div>
);

// Every pick adds three more suggestions, like the real tag step.
const GrowingTags = (): ReactElement => {
  const [picked, setPicked] = useState<string[]>([]);
  const visible = TAGS.slice(0, Math.min(TAGS.length, 6 + picked.length * 3));
  const extra = Math.max(0, picked.length * 3 - (TAGS.length - 6));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-text-tertiary typo-footnote">
        Pick tags: each pick adds suggestions. {picked.length} picked.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {[...visible, ...TAGS.slice(0, extra).map((tag) => `${tag}-2`)].map(
          (tag) => (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setPicked((list) =>
                  list.includes(tag) ? list : [...list, tag],
                )
              }
              className={classNames(
                'rounded-10 border px-3 py-1.5 typo-callout',
                picked.includes(tag)
                  ? 'border-text-primary bg-surface-float text-text-primary'
                  : 'border-border-subtlest-tertiary text-text-secondary',
              )}
            >
              #{tag}
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export const Short: StoryObj<Args> = {
  name: 'Short step (content type)',
  render: ({ mode }) => (
    <Step
      mode={mode}
      headline="What do you want in your feed?"
      description="Pick the formats you like. You can change it later."
    >
      <Rows count={3} />
    </Step>
  ),
};

export const Long: StoryObj<Args> = {
  name: 'Long step (acquisition, 13 rows)',
  render: ({ mode }) => (
    <Step
      mode={mode}
      headline="How did you hear about us?"
      description="It helps us reach more developers like you."
    >
      <Rows count={13} />
    </Step>
  ),
};

export const Growing: StoryObj<Args> = {
  name: 'Growing step (tags, click to grow)',
  render: ({ mode }) => (
    <Step
      mode={mode}
      headline="Pick tags that are relevant to you"
      description="Choose at least five so your feed starts in the right place."
    >
      <GrowingTags />
    </Step>
  ),
};

const frames = [
  { id: 'short', label: 'Short step' },
  { id: 'growing', label: 'Growing step (click tags in the live frames)' },
  { id: 'long', label: 'Long step' },
];

const Compare = ({ id, label }: { id: string; label: string }) => (
  <Section title={label}>
    <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
      <Labeled label="Desktop today" tone="before">
        <DesktopFrame
          storyId={`${ID}--${id}&args=mode:today`}
          title={`${label} today`}
          height={800}
        />
      </Labeled>
      <Labeled label="Desktop new" tone="after">
        <DesktopFrame
          storyId={`${ID}--${id}&args=mode:follow`}
          title={`${label} new`}
          height={800}
        />
      </Labeled>
    </div>
    <Labeled label="Phone: unchanged, pinned to the bottom">
      <PhoneFrame storyId={`${ID}--${id}`} title={`${label} on a phone`} />
    </Labeled>
  </Section>
);
