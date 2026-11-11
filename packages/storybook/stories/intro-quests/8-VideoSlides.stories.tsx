import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';

// Full-screen slides for the team walkthrough video (recorded at 1920×1080).
// The finalists themselves are recorded live from chapter 6.

type Slide =
  | 'title'
  | 'option-1'
  | 'option-2'
  | 'option-3'
  | 'closing';

interface Args {
  slide: Slide;
}

const meta: Meta<Args> = {
  title: 'Intro Quests/8. Video slides',
  parameters: { layout: 'fullscreen' },
  args: { slide: 'title' },
  argTypes: {
    slide: {
      control: 'select',
      options: ['title', 'option-1', 'option-2', 'option-3', 'closing'],
    },
  },
};

export default meta;

const options = [
  {
    number: 1,
    name: 'Action cards',
    line: 'Like today, but organized. Big buttons, rewards up front, a progress bar that pulls you forward.',
  },
  {
    number: 2,
    name: 'Checklist',
    line: 'A compact to-do list. One step open at a time, the simplest to read.',
  },
  {
    number: 3,
    name: 'Journey',
    line: 'Built on Dave’s feature map analysis. The retention drivers, in the right order, hand in hand.',
  },
];

const Frame = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="relative flex flex-col justify-center overflow-hidden bg-background-default px-32 text-text-primary"
    style={{ width: '1920px', height: '1080px' }}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-40 -top-40 size-[40rem] rounded-max bg-accent-cabbage-default opacity-16 blur-3xl"
    />
    <div className="absolute left-32 top-20 flex items-center gap-3">
      <LogoIcon className={{ container: 'h-10' }} />
      <span className="font-bold text-text-tertiary typo-title3">
        Intro quests redesign
      </span>
    </div>
    {children}
  </div>
);

const Title = (): ReactElement => (
  <Frame>
    <p className="mb-6 font-bold text-accent-avocado-default typo-title2">
      New user onboarding · 3 finalists
    </p>
    <h1 className="max-w-[80rem] text-[6rem] font-bold leading-[1.05]">
      Three ways to get new users set up
    </h1>
    <p className="mt-8 max-w-[64rem] text-text-secondary typo-title2">
      Every action now happens inside the popup. Help us pick which one to
      test first.
    </p>
  </Frame>
);

const Option = ({ index }: { index: number }): ReactElement => {
  const option = options[index];

  return (
    <Frame>
      <p className="font-bold text-accent-avocado-default text-[10rem] leading-none">
        {option.number}
      </p>
      <h1 className="mt-6 text-[6rem] font-bold leading-[1.05]">
        {option.name}
      </h1>
      <p className="mt-8 max-w-[70rem] text-text-secondary typo-title2">
        {option.line}
      </p>
    </Frame>
  );
};

const Closing = (): ReactElement => (
  <Frame>
    <h1 className="text-[5.5rem] font-bold leading-[1.05]">
      Which one should we test first?
    </h1>
    <div className="mt-14 grid grid-cols-3 gap-8">
      {options.map((option) => (
        <div
          key={option.number}
          className="flex flex-col gap-4 rounded-32 border border-border-subtlest-secondary bg-surface-float p-10"
        >
          <span className="font-bold text-accent-avocado-default text-[4rem] leading-none">
            {option.number}
          </span>
          <span className="font-bold typo-title1">{option.name}</span>
          <span className="text-text-secondary typo-title3">{option.line}</span>
        </div>
      ))}
    </div>
    <p className="mt-14 font-bold text-text-primary typo-title2">
      Reply in the thread with 1, 2 or 3 🙏
    </p>
  </Frame>
);

export const VideoSlide: StoryObj<Args> = {
  name: 'Slide',
  render: ({ slide }) => {
    switch (slide) {
      case 'option-1':
        return <Option index={0} />;
      case 'option-2':
        return <Option index={1} />;
      case 'option-3':
        return <Option index={2} />;
      case 'closing':
        return <Closing />;
      default:
        return <Title />;
    }
  },
};
