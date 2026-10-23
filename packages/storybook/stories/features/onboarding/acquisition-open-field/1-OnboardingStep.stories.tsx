import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import type { FunnelStepAcquisition } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import {
  featureOnboardingAcquisitionOpenField,
  OnboardingChromeVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { AcquisitionChannel } from '@dailydotdev/shared/src/graphql/users';
import { FeatureOverrides } from '../../../../mock/GrowthBookProvider';
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
 * The signup onboarding step "How did you hear about us?" behind the
 * `onboarding_acquisition_open_field` flag. Flag on: one free-text field
 * instead of the channel list, saved as `other:<answer>`. Flag off (control):
 * today's list. The paid funnel keeps the list either way.
 *
 * Every story renders the production `FunnelAcquisition`; only the save is
 * faked, and the strip at the top shows what was saved and what the funnel
 * received. Stories are grouped by prefix: Flag on, Config, Flow, Platform,
 * Control.
 */

type Params = FunnelStepAcquisition['parameters'];

interface StepArgs {
  isFlagOn: boolean;
  isPaidFunnel: boolean;
  chrome: OnboardingChromeVariant;
  headline?: string;
  explainer?: string;
  cta?: string;
  skip?: string;
}

const Step = ({
  isFlagOn,
  isPaidFunnel,
  chrome,
  headline,
  explainer,
  cta,
  skip,
}: StepArgs): ReactElement => {
  const parameters: Params = { headline, explainer, cta, skip };
  const step = { type: FunnelStepType.Acquisition, parameters };

  return (
    <FeatureOverrides
      values={{ [featureOnboardingAcquisitionOpenField.id]: isFlagOn }}
    >
      <SaveReport>
        {({ onTransition, onRegisterStepToSkip }) => (
          <FunnelStepShell chrome={chrome} step={step} stepIndex={6}>
            {/* The paid funnel has no glass bar and keeps the list. */}
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
                onRegisterStepToSkip={onRegisterStepToSkip}
              />
            </FunnelProgressContext.Provider>
          </FunnelStepShell>
        )}
      </SaveReport>
    </FeatureOverrides>
  );
};

const meta: Meta<StepArgs> = {
  title: 'Features/Onboarding/Acquisition open field/1. Onboarding step',
  component: Step,
  args: {
    isFlagOn: true,
    isPaidFunnel: false,
    chrome: OnboardingChromeVariant.Control,
  },
  argTypes: {
    isFlagOn: {
      name: 'onboarding_acquisition_open_field',
      control: 'boolean',
      description: 'GrowthBook flag. Off is the control: today’s list.',
    },
    isPaidFunnel: {
      control: 'boolean',
      description: 'Paid funnel instead of signup onboarding.',
    },
    chrome: {
      control: 'inline-radio',
      options: Object.values(OnboardingChromeVariant),
      description: 'The onboarding_chrome experiment arm.',
    },
    headline: { control: 'text', description: 'Funnel step config.' },
    explainer: { control: 'text', description: 'Funnel step config.' },
    cta: { control: 'text', description: 'Funnel step config.' },
    skip: { control: 'text', description: 'Funnel step config.' },
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

const docs = (story: string) => ({ docs: { description: { story } } });

const canvasOf = (canvasElement: HTMLElement) => within(canvasElement);
const continueButton = (canvasElement: HTMLElement) =>
  canvasOf(canvasElement).findByRole('button', { name: /Continue|Next/ });
const findField = (canvasElement: HTMLElement) =>
  canvasOf(canvasElement).findByRole(
    'textbox',
    { name: 'How did you hear about us?' },
    { timeout: 10000 },
  );

/* Flag on: the field's states ---------------------------------------------- */

export const Empty: Story = {
  name: 'Flag on · Empty',
  parameters: docs(
    'First paint on desktop: the field is focused, placeholder “Type your answer”, hint “Up to 44 characters. A few words is enough.” (the limit is visible before typing), Continue disabled.',
  ),
  play: async ({ canvasElement }) => {
    const field = await findField(canvasElement);
    // Focus lands in the step's mount effect, a tick after the field paints.
    await waitFor(() => expect(field).toHaveFocus());
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

export const Filled: Story = {
  name: 'Flag on · Filled',
  parameters: docs(
    'Typing enables Continue and shows the × clear button. Focus is a primary-color border; no tint.',
  ),
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await expect(await continueButton(canvasElement)).toBeEnabled();
  },
};

export const FilledUnfocused: Story = {
  name: 'Flag on · Filled, not focused',
  parameters: docs(
    'Once focus leaves, a filled field looks like a resting one: gray, no border change.',
  ),
  play: async ({ canvasElement }) => {
    const field = await typeAnswer(canvasElement, SAMPLE_ANSWER);
    field.blur();
  },
};

export const AtLimit: Story = {
  name: 'Flag on · At the 44 character limit',
  parameters: docs(
    'Typing stops at 44 characters (the API keeps 50, shared with the other: prefix). The hint becomes “You’ve reached the 44-character limit.”; no counter.',
  ),
  play: async ({ canvasElement }) => {
    const field = await typeAnswer(canvasElement, `${LIMIT_ANSWER} extra`);
    await expect(field).toHaveValue(LIMIT_ANSWER);
  },
};

export const PastedOverLimit: Story = {
  name: 'Flag on · Pasted text over the limit',
  parameters: docs('A longer paste is cut to the first 44 characters.'),
  play: async ({ canvasElement }) => {
    const field = await findField(canvasElement);
    await userEvent.click(field);
    await userEvent.paste(`${LIMIT_ANSWER} and then some more words`);
    await expect(field).toHaveValue(LIMIT_ANSWER);
  },
};

export const OnlySpaces: Story = {
  name: 'Flag on · Only spaces',
  parameters: docs('Whitespace is not an answer: Continue stays off.'),
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, '    ');
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

export const Cleared: Story = {
  name: 'Flag on · Cleared with ×',
  parameters: docs(
    '× empties the field and keeps the cursor in it; Continue turns off again.',
  ),
  play: async ({ canvasElement }) => {
    const field = await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(
      canvasOf(canvasElement).getByRole('button', { name: 'Clear answer' }),
    );
    await expect(field).toHaveValue('');
    await expect(field).toHaveFocus();
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

/* Flow: submit, save, skip --------------------------------------------------- */

export const SubmittedWithContinue: Story = {
  name: 'Flow · Submitted with Continue',
  parameters: docs(
    'Saves other:<answer> with whitespace collapsed, then completes the step with acquisitionChannel “other”.',
  ),
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(await continueButton(canvasElement));
    await canvasOf(canvasElement).findByTestId('save-report');
  },
};

export const SubmittedWithEnter: Story = {
  name: 'Flow · Submitted with Enter',
  parameters: docs(
    'Enter (“Go” on phone keyboards) submits once there is an answer. Extra spaces are collapsed before saving.',
  ),
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, ' A   YouTube video ');
    await userEvent.keyboard('{Enter}');
    await canvasOf(canvasElement).findByTestId('save-report');
  },
};

export const Saving: Story = {
  name: 'Flow · Saving',
  parameters: {
    msw: { handlers: [saveHandler({ latency: 'infinite' })] },
    ...docs('While saving: the CTA shows its loader and the field locks.'),
  },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(await continueButton(canvasElement));
  },
};

export const SaveFails: Story = {
  name: 'Flow · Save fails',
  parameters: {
    msw: { handlers: [saveHandler({ fails: true })] },
    ...docs(
      'The answer is analytics only: a failed save still completes the step. No error is shown.',
    ),
  },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
    await userEvent.click(await continueButton(canvasElement));
    await canvasOf(canvasElement).findByTestId('save-report');
  },
};

export const Skipped: Story = {
  name: 'Flow · Skipped',
  args: { skip: 'Skip' },
  parameters: docs(
    'With a skip label in the step config, Skip sits in the top bar and moves on without saving.',
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await canvasOf(canvasElement).findByRole('button', { name: 'Skip' }),
    );
    await canvasOf(canvasElement).findByTestId('save-report');
  },
};

export const AlreadyAnswered: Story = {
  name: 'Flow · Already answered',
  beforeEach: () =>
    bootAsUser({ acquisitionChannel: AcquisitionChannel.Friend }),
  parameters: docs(
    'A profile that already has an acquisition channel never sees the step, in either arm.',
  ),
};

/* Config: what the funnel step config can change ---------------------------- */

export const WithExplainer: Story = {
  name: 'Config · With explainer',
  args: { explainer: 'It helps us reach more developers like you.' },
};

export const WithSkip: Story = {
  name: 'Config · With skip',
  args: { skip: 'Skip' },
};

export const CustomCopy: Story = {
  name: 'Config · Long headline and custom CTA',
  args: {
    headline:
      'Where did you first hear about daily.dev? Be as specific as you like',
    cta: 'Save and continue',
  },
  parameters: docs(
    'The field’s accessible name stays “How did you hear about us?” whatever the headline says.',
  ),
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

/* Platform: devices, chrome and themes ------------------------------------- */

export const TouchDevice: Story = {
  name: 'Platform · Touch device, no autofocus',
  parameters: docs(
    'On touch devices the field is not focused on load: iOS ignores it and Android shows a focused field with no keyboard. People tap to type.',
  ),
  beforeEach: () => {
    Object.defineProperty(window, 'ontouchstart', {
      configurable: true,
      value: null,
    });

    return () => {
      delete (window as { ontouchstart?: unknown }).ontouchstart;
    };
  },
  play: async ({ canvasElement }) => {
    const field = await findField(canvasElement);
    // Give the mount effect the time it would take to focus the field.
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    await expect(field).not.toHaveFocus();
  },
};

export const LightTheme: Story = {
  name: 'Platform · Light theme',
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

export const AuraChrome: Story = {
  name: 'Platform · Aura chrome arm',
  args: { chrome: OnboardingChromeVariant.Aura },
  parameters: docs('Works under both onboarding_chrome arms.'),
  play: async ({ canvasElement }) => {
    await typeAnswer(canvasElement, SAMPLE_ANSWER);
  },
};

/* Control and out of scope ---------------------------------------------------- */

export const ControlArm: Story = {
  name: 'Control · Flag off (today’s list)',
  args: { isFlagOn: false },
  parameters: docs(
    'The control arm is today’s step, unchanged: the channel list with “Other” turning into a text box.',
  ),
};

export const PaidFunnel: Story = {
  name: 'Control · Paid funnel keeps the list',
  args: { isPaidFunnel: true },
  parameters: docs(
    'The flag is only evaluated in signup onboarding. The paid funnel keeps the list even with the flag on.',
  ),
};

export const Playground: Story = {
  name: 'Playground',
  parameters: docs('Every control in the panel, nothing pre-typed.'),
};
