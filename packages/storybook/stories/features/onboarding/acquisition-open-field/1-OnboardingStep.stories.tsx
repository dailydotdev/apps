import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import type { FunnelStepAcquisition } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import { OnboardingChromeVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import {
  bootAsUser,
  FUNNEL_STEP_COUNT,
  FunnelStepShell,
} from '../signupFunnel.mocks';
import {
  LIMIT_ANSWER,
  SAMPLE_ANSWER,
  saveHandler,
  SaveReport,
  typeAnswer,
} from './harness';

/**
 * The signup funnel's "How did you hear about us?" step with
 * `answerStyle: 'open'`: one free-text field instead of the channel list. The
 * answer is stored as `other:<text>`, the same shape the list's "Other" row
 * already writes, so reports keep grouping on the key.
 *
 * Every story renders the production `FunnelAcquisition`; only the save is
 * faked. Use the theme toolbar for light and dark.
 */

type Params = FunnelStepAcquisition['parameters'];

interface StepArgs {
  answerStyle: NonNullable<Params['answerStyle']>;
  headline?: string;
  explainer?: string;
  cta?: string;
  skip?: string;
  chrome: OnboardingChromeVariant;
  isPaidFunnel?: boolean;
}

const Step = ({
  answerStyle,
  headline,
  explainer,
  cta,
  skip,
  chrome,
  isPaidFunnel,
}: StepArgs): ReactElement => {
  const parameters: Params = {
    answerStyle,
    headline,
    explainer,
    cta,
    skip,
  };
  const step = { type: FunnelStepType.Acquisition, parameters };

  return (
    <SaveReport>
      {(onTransition) => (
        <FunnelStepShell chrome={chrome} step={step} stepIndex={6}>
          {/* The paid funnel has no glass bar: a plain CTA under the content. */}
          <FunnelProgressContext.Provider
            value={{
              chapters: [{ steps: FUNNEL_STEP_COUNT }],
              position: { chapter: 0, step: 6 },
              isOnboarding: !isPaidFunnel,
            }}
          >
            <FunnelAcquisition
              id="acquisition"
              type={FunnelStepType.Acquisition}
              isActive
              transitions={[]}
              parameters={parameters}
              onTransition={onTransition}
              onRegisterStepToSkip={() => undefined}
            />
          </FunnelProgressContext.Provider>
        </FunnelStepShell>
      )}
    </SaveReport>
  );
};

const meta: Meta<StepArgs> = {
  title: 'Features/Onboarding/Acquisition open field/1. Onboarding step',
  component: Step,
  args: {
    answerStyle: 'open',
    chrome: OnboardingChromeVariant.Control,
    isPaidFunnel: false,
  },
  argTypes: {
    answerStyle: {
      control: 'inline-radio',
      options: ['open', 'list'],
      labels: { open: 'New: open field', list: 'Today: channel list' },
    },
    chrome: {
      control: 'inline-radio',
      options: Object.values(OnboardingChromeVariant),
    },
  },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [saveHandler()] },
  },
  // `useAuthContext().user.acquisitionChannel` would skip the step.
  beforeEach: () => bootAsUser({ acquisitionChannel: undefined }),
  render: (args) => <Step {...args} />,
};

export default meta;

type Story = StoryObj<StepArgs>;

const continueButton = (canvasElement: HTMLElement) =>
  within(canvasElement).findByRole('button', { name: /Continue|Next/ });

export const Empty: Story = {
  name: 'Empty (focused, CTA off)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByRole('textbox', {
      name: 'How did you hear about us?',
    });
    await expect(field).toHaveFocus();
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

export const Filled: Story = {
  name: 'Filled (clear button, CTA on)',
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await expect(await continueButton(canvasElement)).toBeEnabled();
  },
};

export const AtLimit: Story = {
  name: 'At the 44 character limit',
  play: async ({ canvasElement }) => {
    const field = await typeAnswer(canvasElement, `${LIMIT_ANSWER} extra`);
    await expect(field).toHaveValue(LIMIT_ANSWER);
  },
};

export const OnlySpaces: Story = {
  name: 'Only spaces (CTA stays off)',
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, '    ');
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

export const Cleared: Story = {
  name: 'Cleared with the x button',
  play: async ({ canvasElement }) => {
    const field = await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Clear answer' }),
    );
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
  },
};

export const Saving: Story = {
  name: 'Saving (CTA loading, field locked)',
  parameters: { msw: { handlers: [saveHandler({ latency: 'infinite' })] } },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(await continueButton(canvasElement));
  },
};

export const SubmittedWithEnter: Story = {
  name: 'Submitted with Enter',
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, ' A   YouTube video ');
    await userEvent.keyboard('{Enter}');
    await within(canvasElement).findByTestId('save-report');
  },
};

export const SaveFails: Story = {
  name: 'Save fails (still moves on)',
  parameters: { msw: { handlers: [saveHandler({ fails: true })] } },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(await continueButton(canvasElement));
    await within(canvasElement).findByTestId('save-report');
  },
};

export const WithExplainer: Story = {
  name: 'With explainer',
  args: { explainer: 'It helps us reach more developers like you.' },
};

export const WithSkip: Story = {
  name: 'With skip',
  args: { skip: 'Skip' },
};

export const LongHeadline: Story = {
  name: 'Custom long headline and CTA',
  args: {
    headline:
      'Where did you first hear about daily.dev? Be as specific as you like',
    cta: 'Save and continue',
  },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const AuraChrome: Story = {
  name: 'Aura chrome arm',
  args: { chrome: OnboardingChromeVariant.Aura },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const PaidFunnel: Story = {
  name: 'Paid funnel (no glass bar)',
  args: { isPaidFunnel: true },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const Today: Story = {
  name: 'Today: channel list (for comparison)',
  args: { answerStyle: 'list' },
};

export const Playground: Story = {
  name: 'Playground',
};
