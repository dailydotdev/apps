import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
  FunnelQuiz,
} from '@dailydotdev/shared/src/features/onboarding/steps/FunnelQuiz';
import {
  FunnelStepQuizQuestionType,
  FunnelStepTransitionType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { fn } from '@storybook/test';
import {
  funnelQuizLayout,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  CheckboxGroupVariant,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

const meta: Meta<typeof FunnelQuiz> = {
  title: 'Components/Onboarding/Steps/Quiz',
  component: FunnelQuiz,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6350&t=UeJIDL1A5X9DEOIM-0',
    },
    controls: {
      expanded: true,
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  render: (props) => (
    <div className='invert'>
      <FunnelQuiz {...props} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof FunnelQuiz>;

const commonProps = {
  parameters: {},
  transitions: [],
  explainer: 'This is an explainer text for the quiz',
  onTransition: fn(),
};

export const RatingQuestion: Story = {
  args: {
    id: 'rating-question',
    ...commonProps,
    parameters: {
      ...commonProps.parameters,
      question: {
        type: FunnelStepQuizQuestionType.Rating,
        text: 'How likely are you to recommend daily.dev to a friend?',
        options: Array.from({ length: 5 }, (_, i) => ({
          label: `${i + 1}`,
        })),
      },
    },
  },
};

export const SingleChoice: Story = {
  args: {
    id: 'radio-question',
    ...commonProps,
    parameters: {
      ...commonProps.parameters,
      question: {
        type: FunnelStepQuizQuestionType.Radio,
        text: 'What is your primary role?',
        options: [
          { label: 'Software Engineer' },
          { label: 'Frontend Developer' },
          { label: 'Backend Developer' },
          { label: 'Full-stack Developer' },
          { label: 'DevOps Engineer' },
        ],
      },
    },
  },
};

export const MultipleChoice: Story = {
  args: {
    id: 'checkbox-question',
    ...commonProps,
    parameters: {
      ...commonProps.parameters,
      question: {
        type: FunnelStepQuizQuestionType.Checkbox,
        text: 'Which technologies are you interested in?',
        options: [
          { label: 'JavaScript' },
          { label: 'TypeScript' },
          { label: 'React' },
          { label: 'Angular' },
          { label: 'Vue.js' },
          { label: 'Node.js' },
        ],
      },
    },
  },
};

export const MultipleChoiceVertical: Story = {
  args: {
    id: 'checkbox-question',
    ...commonProps,
    parameters: {
      ...commonProps.parameters,
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
    },
  },
};

export const QuestionWithImage: Story = {
  args: {
    id: 'question-with-image',
    ...commonProps,
    parameters: {
      ...commonProps.parameters,
      question: {
        type: FunnelStepQuizQuestionType.Checkbox,
        text: 'Which feature would you like to see next?',
        options: [
          { label: 'Better AI integration' },
          { label: 'More code examples' },
          { label: 'Team collaboration tools' },
          { label: 'Advanced analytics' },
        ],
        imageUrl: 'https://placehold.co/400x600',
      },
    },
  },
};
