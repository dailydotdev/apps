import { FunnelStepper } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import {
  FunnelStepType,
  FunnelStepTransitionType,
  FunnelStepQuizQuestionType,
  type FunnelJSON,
  type FunnelStepChapter,
  type FunnelStepQuiz,
  type FunnelStepSocialProof,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'jotai';

const meta: Meta<typeof FunnelStepper> = {
  title: 'Components/Onboarding/FunnelStepper',
  component: FunnelStepper,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Provider>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFunnel: FunnelJSON = {
  id: 'sample-funnel',
  version: 1,
  parameters: {
    cta: 'Continue',
  },
  entryPoint: 'step1',
  steps: [
    {
      id: 'chapter1',
      parameters: {
        cta: 'Continue',
      },
      transitions: [
        {
          on: FunnelStepTransitionType.Complete,
          destination: 'step2',
        },
      ],
      steps: [
        {
          id: 'step1',
          type: FunnelStepType.Quiz,
          parameters: {
            cta: 'Next',
          },
          question: {
            type: FunnelStepQuizQuestionType.Rating,
            text: 'How would you rate your experience with daily.dev?',
            options: [
              { label: '1' },
              { label: '2' },
              { label: '3' },
              { label: '4' },
              { label: '5' },
            ],
          },
          explainer: 'This helps us understand how we can improve',
          transitions: [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'step2',
            },
            {
              on: FunnelStepTransitionType.Skip,
              destination: 'step2',
            },
          ],
          onTransition: () => {
            console.log('Quiz step transition');
          },
        } satisfies FunnelStepQuiz,
        {
          id: 'step2',
          type: FunnelStepType.SocialProof,
          parameters: {
            cta: 'Continue',
          },
          imageUrl: 'https://daily.dev/social-proof.png',
          rating: '4.8',
          reviews: [
            {
              title: 'Great Platform',
              content: 'Great platform for developers!',
              author: 'John Doe',
            },
          ],
          reviewSubtitle: 'Join thousands of satisfied developers',
          transitions: [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'step1', // Changed to point to an existing step
            },
          ],
          onTransition: () => {
            console.log('Social proof step transition');
          },
        } satisfies FunnelStepSocialProof,
      ],
    } satisfies FunnelStepChapter,
  ],
};

export const Default: Story = {
  args: {
    funnel: sampleFunnel,
  },
};
