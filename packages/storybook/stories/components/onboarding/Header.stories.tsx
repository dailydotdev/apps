import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from '@dailydotdev/shared/src/features/onboarding/shared/Header';

const meta: Meta<typeof Header> = {
  title: 'Components/Onboarding/Shared/Header',
  component: Header,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6364&t=MIkH1TAMMga5AbSg-4',
    },
    controls: {
      expanded: true,
    },
  },
  args: {
    currentChapter: 0,
    currentStep: 0,
    chapters: [
      { steps: 3 },
      { steps: 2 },
      { steps: 4 }
    ],
    showBackButton: true,
    showSkipButton: true,
    showProgressBar: true,
    onBack: () => console.log('Back clicked'),
    onSkip: () => console.log('Skip clicked'),
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {};

export const MidProgress: Story = {
  args: {
    currentChapter: 1,
    currentStep: 1,
  },
};

export const NoButtons: Story = {
  args: {
    showBackButton: false,
    showSkipButton: false,
  },
};

export const NoProgressBar: Story = {
  args: {
    showProgressBar: false,
  },
};

export const CompleteChapter: Story = {
  args: {
    currentChapter: 1,
    currentStep: 0,
  },
};
