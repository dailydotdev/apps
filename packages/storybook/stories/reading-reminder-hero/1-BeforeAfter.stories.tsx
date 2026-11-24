import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DeviceName } from '../sources/device';
import { Device } from '../sources/device';
import { FeedMock } from './FeedMock';
import { ProposedHero, ProposedTopHero } from './ProposedHero';
import { TodayHero } from './TodayHero';

const meta: Meta = {
  title: 'Growth/Reading reminder hero/1. Before and after',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const noop = (): void => undefined;

/** Reports the hero's rendered height, so "same height" can be checked. */
const Measured = ({
  onHeight,
  children,
}: {
  onHeight: (height: number) => void;
  children: ReactNode;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = box.current;
    if (!element) {
      return undefined;
    }
    const view = element.ownerDocument.defaultView ?? window;
    const observer = new view.ResizeObserver(() =>
      onHeight(Math.round(element.getBoundingClientRect().height)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeight]);
  return <div ref={box}>{children}</div>;
};

const Proposed = ({ isLaptop }: { isLaptop: boolean }): ReactElement =>
  isLaptop ? (
    <ProposedTopHero
      step="offer"
      readingHour={20}
      className="order-first"
      onClose={noop}
    />
  ) : (
    <ProposedHero step="offer" readingHour={20} onClose={noop} />
  );

const Pair = ({
  device,
  theme,
  height,
}: {
  device: DeviceName;
  theme?: 'dark' | 'light';
  height?: number;
}): ReactElement => {
  const isLaptop = device.startsWith('laptop');
  const [todayHeight, setTodayHeight] = useState(0);
  const [proposedHeight, setProposedHeight] = useState(0);
  return (
    <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Device
          device={device}
          theme={theme}
          height={height}
          url="/"
          label={`Today${theme ? '' : ` · ${device}`}`}
        >
          <FeedMock
            isLaptop={isLaptop}
            hero={
              <Measured onHeight={setTodayHeight}>
                <TodayHero isLaptop={isLaptop} onEnable={noop} onClose={noop} />
              </Measured>
            }
          />
        </Device>
        <span className="text-text-tertiary typo-caption1">
          Hero height {todayHeight}px
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Device
          device={device}
          theme={theme}
          height={height}
          url="/"
          label={`Proposed${theme ? '' : ` · ${device}`}`}
        >
          <FeedMock
            isLaptop={isLaptop}
            hero={
              <Measured onHeight={setProposedHeight}>
                <Proposed isLaptop={isLaptop} />
              </Measured>
            }
          />
        </Device>
        <span className="text-text-tertiary typo-caption1">
          Hero height {proposedHeight}px
        </span>
      </div>
    </div>
  );
};

const Page = ({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-8 px-4 py-8 tablet:px-8">
    <header className="flex max-w-[44rem] flex-col gap-2">
      <h1 className="font-bold text-text-primary typo-title1">{title}</h1>
      <p className="text-text-secondary typo-body">{intro}</p>
    </header>
    {children}
  </div>
);

export const Responsive: StoryObj = {
  render: () => (
    <Page
      title="Centered on every width"
      intro="Today is what production renders, the same components with the same props: ReadingReminderFeedHero at the top of the feed on phones and tablets (a left-aligned row from tablet up), and TopHero in the strip above the feed frame from 1024px up. Only the feed around it is a mock. The proposal keeps each slot and its height, centered, with Patchy and the reader's own hour."
    >
      <Pair device="phone" height={640} />
      <Pair device="tablet" height={640} />
      <Pair device="laptop" height={480} />
      <Pair device="laptopL" height={480} />
    </Page>
  ),
};

export const Themes: StoryObj = {
  render: () => (
    <Page
      title="Light theme on phones"
      intro="Today's card is drawn in fixed dark colors, so in light theme the title and button disappear. The proposal uses theme tokens and reads in both."
    >
      <div className="flex flex-col gap-6">
        <h2 className="font-bold text-text-primary typo-title3">Light</h2>
        <Pair device="phone" theme="light" height={600} />
        <h2 className="font-bold text-text-primary typo-title3">Dark</h2>
        <Pair device="phone" theme="dark" height={600} />
      </div>
    </Page>
  ),
};
