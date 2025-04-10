import {
  FunnelStepper,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper';
import {
  FunnelStepType,
  FunnelStepTransitionType,
  FunnelStepQuizQuestionType,
  type FunnelJSON,
  type FunnelChapter,
  type FunnelStepQuiz,
  type FunnelStepSocialProof,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'jotai';
import { withThemeByClassName } from '@storybook/addon-themes';
import { ReactRenderer } from '@storybook/react';
import { Default as FunnelPricing } from './FunnelPricing.stories';
import {
  FunnelStepPricing,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import {
  CheckboxGroupVariant,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

const queryClient = new QueryClient();

const meta: Meta<typeof FunnelStepper> = {
  title: 'Components/Onboarding/FunnelStepper',
  component: FunnelStepper,
  tags: ['autodocs'],
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'dark',
    }),
    (Story) => (
      <Provider>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </Provider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
    },
  },
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
  chapters: [
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
          },
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
        } satisfies FunnelStepQuiz, {
          id: 'step2',
          type: FunnelStepType.Quiz,
          parameters: {
            question: {
              type: FunnelStepQuizQuestionType.Checkbox,
              variant: CheckboxGroupVariant.Vertical,
              cols: 2,
              text: 'Which technologies are you interested in?',
              options: [
                {
                  label: 'JavaScript',
                  value: 'js',
                  image: {
                    src: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
                    alt: 'JavaScript',
                  },
                },
                {
                  label: 'Python',
                  value: 'py',
                  image: {
                    src: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
                    alt: 'Python',
                  },
                },
                {
                  label: 'Go',
                  value: 'go',
                  image: {
                    src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg',
                    alt: 'Go',
                  },
                },
              ],
            },
            explainer: 'This helps us understand how we can improve',
          },
          transitions: [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'step3',
            },
            {
              on: FunnelStepTransitionType.Skip,
              destination: 'step3',
            },
          ],
          onTransition: () => {
            console.log('Quiz step transition');
          },
        } satisfies FunnelStepQuiz,
        // {
        //   id: 'step3',
        //   type: FunnelStepType.Loading,
        //   parameters: {
        //     headline: 'Loading your personalized feed',
        //     explainer: 'We\'re putting together content based on your interests. This will only take a moment.',
        //   },
        //   transitions: [
        //     {
        //       on: FunnelStepTransitionType.Complete,
        //       destination: 'step4',
        //     },
        //   ],
        //   onTransition: fn(),
        // } satisfies FunnelStepLoading,
        {
          id: 'step3',
          type: FunnelStepType.SocialProof,
          parameters: {
            cta: 'Continue',
          },
          imageUrl: 'https://media.daily.dev/image/upload/s--44oMC43t--/f_auto/v1743947482/public/Rating',
          rating: '4.8/5',
          reviewSubtitle: 'based on 2,598+ reviews',
          reviews: [
            {
              title: 'Perfect for Busy People',
              content:
                '"I used to spend hours sifting through Hacker News, Reddit, and newsletters. Now, I get everything I need in one place."',
              author: 'Priya, Full-Stack Dev',
            },
            {
              title: 'Quality Content',
              content:
                '"daily.dev is my go-to dev feed. No fluff, no clickbait—just quality."',
              author: 'Alex, Senior Engineer',
            },
            {
              title: 'Saved My Time',
              content:
                '"As a tech lead, staying updated is crucial. daily.dev curates the most relevant content so I don\'t miss anything important."',
              author: 'Michael, Tech Lead',
            },
            {
              title: 'Great for Learning',
              content:
                '"The personalized feed helps me discover new technologies and best practices that I wouldn\'t have found otherwise."',
              author: 'Sarah, Junior Developer',
            },
          ],
          transitions: [
            {
              on: FunnelStepTransitionType.Complete,
              destination: 'step4', // Changed to point to an existing step
            },
          ],
          onTransition: () => {
            console.log('Social proof step transition');
          },
        } satisfies FunnelStepSocialProof,
        {
          ...FunnelPricing.args,
          id: 'step4',
          type: FunnelStepType.Pricing,
          transitions: [],
        } as FunnelStepPricing,
      ],
    } satisfies FunnelChapter,
  ],
};

export const Default: Story = {
  args: {
    funnel: sampleFunnel,
  },
};
