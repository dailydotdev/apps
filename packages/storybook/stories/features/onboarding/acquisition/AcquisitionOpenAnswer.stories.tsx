import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { delay, graphql, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import type { FunnelStepAcquisition } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  bootAsUser,
  FunnelStepShell,
  PROFILE_HANDLERS,
} from '../signupFunnel.mocks';

/**
 * **How did you hear about us? · open answer**: the acquisition step asks the
 * question with a single text field instead of the list of channels, so the
 * answer is what people remember rather than the closest option we offered.
 *
 * It is the real funnel step (`FunnelAcquisition`) with
 * `answerStyle: 'open'`; the options list stays the default, shown here as
 * "Control" for comparison. The answer is saved as `open:<answer>` (the API
 * caps the whole value at 50 characters, so 45 are left for the answer),
 * "I don't remember" saves `dont_remember` like the list does, and a failed
 * save still moves the funnel on.
 *
 * Walk the states in order, then "Breakpoints" for every width at once.
 */

type Parameters = FunnelStepAcquisition['parameters'];

interface StepArgs extends Parameters {
  chrome?: OnboardingChromeVariant;
}

const STEP_ID = 'acquisition';

// The daily.dev breakpoints (`tailwind.config.ts` screens), one viewport each.
const VIEWPORTS = {
  phoneS: {
    name: 'Phone S · 320',
    styles: { width: '320px', height: '640px' },
    type: 'mobile',
  },
  phone: {
    name: 'Phone · 375',
    styles: { width: '375px', height: '812px' },
    type: 'mobile',
  },
  mobileL: {
    name: 'mobileL · 420',
    styles: { width: '420px', height: '860px' },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet · 768',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet',
  },
  laptop: {
    name: 'Laptop · 1280',
    styles: { width: '1280px', height: '800px' },
    type: 'desktop',
  },
  laptopXL: {
    name: 'laptopXL · 1680',
    styles: { width: '1680px', height: '1050px' },
    type: 'desktop',
  },
  desktop: {
    name: 'Desktop · 1980',
    styles: { width: '1980px', height: '1100px' },
    type: 'desktop',
  },
} as const;

const onViewport = (value: keyof typeof VIEWPORTS) => ({
  viewport: { value, isRotated: false },
});

const saveHandler = ({
  latency = 400,
  fails = false,
}: { latency?: number | 'infinite'; fails?: boolean } = {}) =>
  graphql.mutation('AddUserAcquisitionChannel', async () => {
    await delay(latency);

    return fails
      ? HttpResponse.json({ errors: [{ message: 'Could not save' }] })
      : HttpResponse.json({ data: { addUserAcquisitionChannel: { _: true } } });
  });

const meta: Meta<StepArgs> = {
  title: 'Features/Onboarding/Acquisition open answer',
  argTypes: {
    chrome: {
      control: { type: 'inline-radio' },
      options: Object.values(OnboardingChromeVariant),
    },
    answerStyle: {
      control: { type: 'inline-radio' },
      options: ['open', 'options'],
    },
    headline: { control: 'text' },
    explainer: { control: 'text' },
    placeholder: { control: 'text' },
    cta: { control: 'text' },
    skip: { control: 'text' },
  },
  args: {
    chrome: OnboardingChromeVariant.Control,
    answerStyle: 'open',
  },
  parameters: {
    layout: 'fullscreen',
    viewport: { options: VIEWPORTS },
    msw: { handlers: [saveHandler(), ...PROFILE_HANDLERS] },
  },
  beforeEach: () => bootAsUser({ name: 'Ido Shamun', username: 'ido' }),
};

export default meta;

type Story = StoryObj<StepArgs>;

const storyDocs = (story: string) => ({ docs: { description: { story } } });

/**
 * What the funnel would receive when the step finishes. The step renders
 * nothing once it is done, so without this a submit would look broken.
 */
const Step = ({ chrome, ...parameters }: StepArgs): ReactElement => {
  const [transition, setTransition] = useState<unknown>();
  const step = {
    id: STEP_ID,
    type: FunnelStepType.Acquisition,
    isActive: true,
    parameters,
    transitions: [],
    onTransition: setTransition,
    onRegisterStepToSkip: () => undefined,
  } as unknown as FunnelStepAcquisition;

  return (
    <div className="flex min-h-dvh flex-col">
      {!!transition && (
        <div className="flex flex-col gap-1 bg-surface-float px-6 py-3">
          <span className="font-bold text-text-primary typo-footnote">
            The step finished and handed this to the funnel:
          </span>
          <code className="break-all text-text-tertiary typo-footnote">
            {JSON.stringify(transition)}
          </code>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <FunnelStepShell chrome={chrome} step={step} stepIndex={5}>
          <FunnelAcquisition {...step} />
        </FunnelStepShell>
      </div>
    </div>
  );
};

const field = (canvasElement: HTMLElement) =>
  within(canvasElement).findByRole('textbox');

const typeAnswer = async (canvasElement: HTMLElement, answer: string) => {
  const input = await field(canvasElement);

  await userEvent.click(input);
  await userEvent.type(input, answer, { delay: 40 });

  return input;
};

// The onboarding CTA reads "Continue" unless the config names it.
const tapContinue = async (canvasElement: HTMLElement) =>
  userEvent.click(
    await within(canvasElement).findByRole('button', { name: 'Continue' }),
  );

const render = (args: StepArgs) => <Step {...args} />;

/* ---------------------------------------------------------------------------
 * States
 * ------------------------------------------------------------------------- */

export const Empty: Story = {
  name: '01 · Empty',
  parameters: storyDocs(
    'What people land on: the question, one text field with an example placeholder, and "I don\'t remember". Continue stays disabled until there is something to send. On laptops the field is focused straight away; on phones it is not, so the keyboard doesn\'t cover the question before anyone has read it.',
  ),
  render,
};

export const Typing: Story = {
  name: '02 · Typing an answer',
  parameters: storyDocs(
    'An answer typed in: the field takes the brand border while focused and Continue unlocks. Enter (the keyboard\'s "send" key on phones) submits too.',
  ),
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, 'A friend at work told me about it');
  },
};

export const AtTheLimit: Story = {
  name: '03 · At the character limit',
  parameters: storyDocs(
    'The API keeps 50 characters, 45 of them for the answer. At the limit the field stops taking input and a short line says so — helper copy, not a counter.',
  ),
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(
      canvasElement,
      'Saw a talk at a JS meetup in Berlin, then googled it later on',
    );
  },
};

export const BlankAnswer: Story = {
  name: '04 · Only spaces',
  parameters: storyDocs(
    'Whitespace is not an answer: Continue stays disabled.',
  ),
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, '     ');
  },
};

export const Submitting: Story = {
  name: '05 · Submitting',
  parameters: {
    ...storyDocs('Continue tapped while the save is in flight: the button spins.'),
    msw: { handlers: [saveHandler({ latency: 'infinite' })] },
  },
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, 'Reddit');
    await tapContinue(canvasElement);
  },
};

export const Submitted: Story = {
  name: '06 · Submitted',
  parameters: storyDocs(
    'The save finished: the funnel receives the stored value, `open:<answer>`, with spaces collapsed.',
  ),
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, 'a   YouTube video by Fireship ');
    await tapContinue(canvasElement);
  },
};

export const SaveFails: Story = {
  name: '07 · Save fails',
  parameters: {
    ...storyDocs(
      'The answer is analytics, so a failed save never holds the funnel up: it moves on exactly as if it had saved.',
    ),
    msw: { handlers: [saveHandler({ fails: true })] },
  },
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, 'Hacker News');
    await tapContinue(canvasElement);
  },
};

export const DontRemember: Story = {
  name: '08 · I don’t remember',
  parameters: storyDocs(
    'The escape hatch saves `dont_remember`, the same value the list saves, so both arms stay comparable.',
  ),
  render,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: "I don't remember",
      }),
    );
  },
};

/* ---------------------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------------------- */

export const WithExplainer: Story = {
  name: '09 · With explainer',
  parameters: storyDocs('The optional line under the headline.'),
  args: {
    explainer: 'A few words is perfect. It helps us reach more developers.',
  },
  render,
};

export const WithSkip: Story = {
  name: '10 · With skip',
  parameters: storyDocs(
    'With `skip` set, the step can be passed over without an answer.',
  ),
  args: { skip: 'Skip' },
  render,
};

export const CustomCopy: Story = {
  name: '11 · Custom headline, placeholder and CTA',
  parameters: storyDocs(
    'Headline (HTML allowed), placeholder and CTA all come from the funnel config.',
  ),
  args: {
    headline: 'Where did you <span class="text-brand-default">find us</span>?',
    placeholder: 'A friend, a newsletter, a video…',
    cta: 'Next',
  },
  render,
};

export const Dark: Story = {
  name: '12 · Dark theme',
  globals: { theme: 'dark' },
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, 'GitHub trending');
  },
};

export const Control: Story = {
  name: '13 · Control · options list',
  parameters: storyDocs(
    'Today\'s step, unchanged, for comparison: `answerStyle` left at its default.',
  ),
  args: { answerStyle: 'options' },
  render,
};

/* ---------------------------------------------------------------------------
 * Breakpoints
 * ------------------------------------------------------------------------- */

export const Phone: Story = {
  name: '14 · Phone · 375',
  globals: onViewport('phone'),
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, 'TikTok');
  },
};

export const PhoneSmall: Story = {
  name: '15 · Phone S · 320',
  globals: onViewport('phoneS'),
  args: { skip: 'Skip', explainer: 'A few words is perfect.' },
  render,
  play: async ({ canvasElement }) => {
    await typeAnswer(
      canvasElement,
      'Saw a talk at a JS meetup in Berlin, then googled it later on',
    );
  },
};

export const Tablet: Story = {
  name: '16 · Tablet · 768',
  globals: onViewport('tablet'),
  render,
};

export const Laptop: Story = {
  name: '17 · Laptop · 1280',
  globals: onViewport('laptop'),
  render,
};

export const LaptopXL: Story = {
  name: '18 · laptopXL · 1680',
  globals: onViewport('laptopXL'),
  render,
};

const BOARD = [
  ['Phone S · 320', 320, 640],
  ['Phone · 375', 375, 812],
  ['mobileL · 420', 420, 860],
  ['Tablet · 768', 768, 1024],
  ['Laptop · 1280', 1280, 800],
  ['laptopXL · 1680', 1680, 1050],
] as const;

// Each frame loads the Empty story on its own, so its media queries see the
// frame's width, not the board's.
const BoardFrame = ({
  label,
  width,
  height,
  theme,
}: {
  label: string;
  width: number;
  height: number;
  theme: string;
}): ReactElement => {
  const scale = Math.min(1, 360 / width);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-text-tertiary typo-footnote">
        {label}
      </figcaption>
      <div
        className="overflow-hidden rounded-12 border border-border-subtlest-tertiary"
        style={{ width: width * scale, height: height * scale }}
      >
        <iframe
          src={`iframe.html?id=features-onboarding-acquisition-open-answer--empty&viewMode=story&globals=theme:${theme}`}
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            border: 0,
          }}
          title={label}
        />
      </div>
    </figure>
  );
};

export const Breakpoints: Story = {
  name: '19 · Breakpoints · all at once',
  parameters: storyDocs(
    'Every daily.dev breakpoint side by side, each frame a real viewport of that width (scaled down to fit).',
  ),
  render: (_, { globals }) => (
    <div className="flex flex-wrap items-start gap-6 bg-background-default p-6">
      {BOARD.map(([label, width, height]) => (
        <BoardFrame
          height={height}
          key={label}
          label={label}
          theme={globals.theme ?? 'light'}
          width={width}
        />
      ))}
    </div>
  ),
};
