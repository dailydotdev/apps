import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FunnelAcquisition } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelAcquisition';
import type { FunnelStepAcquisition } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelProgressContext } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepDots';
import {
  featureOnboardingAcquisitionFollowUp,
  OnboardingChromeVariant,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { FeatureOverrides } from '../../../../mock/GrowthBookProvider';
import {
  bootAsUser,
  FUNNEL_STEP_COUNT,
  FunnelStepShell,
} from '../signupFunnel.mocks';
import {
  AI_HEADLINE,
  AI_OPTION,
  LIMIT_SEARCH,
  pickAndContinue,
  SAMPLE_PROMPT,
  SAMPLE_SEARCH,
  saveHandler,
  SaveReport,
  SEARCH_HEADLINE,
  SEARCH_OPTION,
  typeInto,
} from './harness';

/**
 * The signup onboarding step "How did you hear about us?" behind the
 * `onboarding_acquisition_follow_up` flag. Flag on: picking "Search engine" or
 * "AI assistant" opens one follow-up page, the same for both but the headline:
 * what did you search for, or what did you ask the AI. Every other pick, the control arm and the
 * paid funnel finish at the list as today.
 *
 * Every story renders the production `FunnelAcquisition`; only the save is
 * faked. Once the step finishes, the strip at the top lists every save in
 * order and what the funnel received. Stories are grouped by prefix: List,
 * Search, AI, Flow, Platform, Control.
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
      values={{ [featureOnboardingAcquisitionFollowUp.id]: isFlagOn }}
    >
      <SaveReport>
        {({ onTransition, onRegisterStepToSkip }) => (
          <FunnelStepShell chrome={chrome} step={step} stepIndex={6}>
            {/* The paid funnel has no glass bar and never gets the follow-up. */}
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
  title: 'Features/Onboarding/Acquisition follow-up/1. Flow',
  component: Step,
  args: {
    isFlagOn: true,
    isPaidFunnel: false,
    chrome: OnboardingChromeVariant.Control,
  },
  argTypes: {
    isFlagOn: {
      name: 'onboarding_acquisition_follow_up',
      control: 'boolean',
      description: 'GrowthBook flag. Off is the control: no follow-up.',
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
    headline: { control: 'text', description: 'List step config.' },
    explainer: { control: 'text', description: 'List step config.' },
    cta: { control: 'text', description: 'List step config.' },
    skip: { control: 'text', description: 'List step config.' },
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
const findField = (canvasElement: HTMLElement, name: string) =>
  canvasOf(canvasElement).findByRole('textbox', { name }, { timeout: 10000 });
const finished = (canvasElement: HTMLElement) =>
  canvasOf(canvasElement).findByTestId('save-report', undefined, {
    timeout: 10000,
  });

/* List: the first screen, the same in both arms ---------------------------- */

export const List: Story = {
  name: 'List · Unchanged first screen',
  parameters: docs(
    'Both arms see today’s list. The follow-up only appears after Continue, for Search engine and AI assistant.',
  ),
};

export const ListSearchPicked: Story = {
  name: 'List · Search engine picked',
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await canvasOf(canvasElement).findByRole(
        'checkbox',
        { name: SEARCH_OPTION },
        { timeout: 10000 },
      ),
    );
  },
};

/* Search: the follow-up after "Search engine" ------------------------------ */

export const SearchEmpty: Story = {
  name: 'Search · Empty',
  parameters: docs(
    '“What did you search for?”, placeholder “Type your answer”, counter 36 on the right, hint “Your best guess is fine.”, Continue disabled, Back and Skip in the top bar. The plain channel is already saved.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    const field = await findField(canvasElement, SEARCH_HEADLINE);
    await waitFor(() => expect(field).toHaveFocus());
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

export const SearchFilled: Story = {
  name: 'Search · Filled',
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await typeInto(canvasElement, SEARCH_HEADLINE, SAMPLE_SEARCH);
    await expect(await continueButton(canvasElement)).toBeEnabled();
  },
};

export const SearchAtLimit: Story = {
  name: 'Search · At the 36 character limit',
  parameters: docs(
    'The search field takes 36 characters: the API keeps 50, minus the search_engine: prefix. The counter reads 0.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    const field = await typeInto(
      canvasElement,
      SEARCH_HEADLINE,
      `${LIMIT_SEARCH} more`,
    );
    await expect(field).toHaveValue(LIMIT_SEARCH);
  },
};

export const SearchSubmitted: Story = {
  name: 'Search · Submitted',
  parameters: docs(
    'Saves search_engine first, then search_engine:<query> on top, and completes with acquisitionChannel “search_engine”.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await typeInto(canvasElement, SEARCH_HEADLINE, SAMPLE_SEARCH);
    await userEvent.keyboard('{Enter}');
    await finished(canvasElement);
  },
};

/* AI: the follow-up after "AI assistant" ----------------------------------- */

export const AIEmpty: Story = {
  name: 'AI · Empty',
  parameters: docs(
    'The same page as Search with its own headline: “What did you ask the AI?”, placeholder “Type your answer”, counter 47 (ai: is a shorter prefix), Continue disabled.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, AI_OPTION);
    await findField(canvasElement, AI_HEADLINE);
    await expect(await continueButton(canvasElement)).toBeDisabled();
  },
};

export const AIFilled: Story = {
  name: 'AI · Filled',
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, AI_OPTION);
    await typeInto(canvasElement, AI_HEADLINE, SAMPLE_PROMPT);
    await expect(await continueButton(canvasElement)).toBeEnabled();
  },
};

export const AISubmitted: Story = {
  name: 'AI · Submitted',
  parameters: docs('Saves ai first, then ai:<prompt> on top.'),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, AI_OPTION);
    await typeInto(canvasElement, AI_HEADLINE, SAMPLE_PROMPT);
    await userEvent.click(await continueButton(canvasElement));
    await finished(canvasElement);
  },
};

/* Flow: back, skip, save --------------------------------------------------- */

export const Skipped: Story = {
  name: 'Flow · Follow-up skipped',
  parameters: docs(
    'Skip completes the step with the plain channel saved when the follow-up opened. Nothing else is sent.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await findField(canvasElement, SEARCH_HEADLINE);
    await userEvent.click(
      await canvasOf(canvasElement).findByRole('button', { name: 'Skip' }),
    );
    await finished(canvasElement);
  },
};

export const BackToList: Story = {
  name: 'Flow · Back to the list',
  parameters: docs(
    'The back arrow returns to the list with the pick still selected; changing it and continuing works as normal.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, AI_OPTION);
    await findField(canvasElement, AI_HEADLINE);
    await userEvent.click(
      await canvasOf(canvasElement).findByRole('button', { name: 'Go back' }),
    );
    await expect(
      await canvasOf(canvasElement).findByRole('checkbox', { name: AI_OPTION }),
    ).toHaveAttribute('aria-checked', 'true');
  },
};

export const Saving: Story = {
  name: 'Flow · Saving',
  parameters: {
    msw: { handlers: [saveHandler({ latency: 'infinite' })] },
    ...docs(
      'While saving the detail: the CTA shows its loader and the field locks.',
    ),
  },
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await typeInto(canvasElement, SEARCH_HEADLINE, SAMPLE_SEARCH);
    await userEvent.click(await continueButton(canvasElement));
  },
};

export const SaveFails: Story = {
  name: 'Flow · Save fails',
  parameters: {
    msw: { handlers: [saveHandler({ fails: true })] },
    ...docs(
      'The answer is analytics only: failed saves still complete the step, with no error shown.',
    ),
  },
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await typeInto(canvasElement, SEARCH_HEADLINE, SAMPLE_SEARCH);
    await userEvent.click(await continueButton(canvasElement));
    await finished(canvasElement);
  },
};

export const OtherChannel: Story = {
  name: 'Flow · Other picks finish at the list',
  parameters: docs(
    'Every pick but Search engine and AI assistant completes at the list, exactly as today.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, 'Reddit');
    await finished(canvasElement);
  },
};

/* Platform: devices, chrome and themes ------------------------------------- */

export const TouchDevice: Story = {
  name: 'Platform · Touch device, no autofocus',
  parameters: docs(
    'On touch devices the follow-up field is not focused on load: iOS ignores it and Android shows a focused field with no keyboard.',
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
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    const field = await findField(canvasElement, SEARCH_HEADLINE);
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
    await pickAndContinue(canvasElement, AI_OPTION);
    await typeInto(canvasElement, AI_HEADLINE, SAMPLE_PROMPT);
  },
};

export const AuraChrome: Story = {
  name: 'Platform · Aura chrome arm',
  args: { chrome: OnboardingChromeVariant.Aura },
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await typeInto(canvasElement, SEARCH_HEADLINE, SAMPLE_SEARCH);
  },
};

/* Control and out of scope ---------------------------------------------------- */

export const ControlArm: Story = {
  name: 'Control · Flag off',
  args: { isFlagOn: false },
  parameters: docs(
    'The control arm is today’s step: Search engine completes at the list with no follow-up.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await finished(canvasElement);
  },
};

export const PaidFunnel: Story = {
  name: 'Control · Paid funnel',
  args: { isPaidFunnel: true },
  parameters: docs(
    'The flag is only evaluated in signup onboarding. The paid funnel finishes at the list even with the flag on.',
  ),
  play: async ({ canvasElement }) => {
    await pickAndContinue(canvasElement, SEARCH_OPTION);
    await finished(canvasElement);
  },
};

export const Playground: Story = {
  name: 'Playground',
  parameters: docs('Every control in the panel, nothing pre-filled.'),
};
