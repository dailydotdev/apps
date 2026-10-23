import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PlusPlacement, ShellProps } from './shell';
import { V2Shell } from './shell';

// Where the "Get Plus" button lives on the v2 desktop shell so a non-member
// sees it without hovering anything. Today its only entry is the first row of
// the You panel, and the panel is collapsed by default (Plus visits 6.5% →
// 0.9% in the layout_v2_reboot read).

interface Option {
  id: PlusPlacement;
  title: string;
  summary: string;
  details: string[];
  tradeOff: string;
}

const OPTIONS: Option[] = [
  {
    id: 'rail-pill',
    title: 'A. Plus button on the rail',
    summary:
      'A filled Plus button at the bottom of the rail, on every page, whether the panel is open or not.',
    details: [
      'Sits in the Invite slot of the bottom group. Invite moves into the Support ("?") menu.',
      'It is shorter than the button it replaces, so no tab folds into "More" sooner.',
      'Members see Invite back in its slot.',
    ],
    tradeOff: 'Invite loses its one-click spot on the rail.',
  },
  {
    id: 'floating-card',
    title: 'B. Floating Plus card',
    summary:
      'A small card at the bottom-left of the page, next to the rail, while the panel is collapsed. Opening the panel docks it into the panel.',
    details: [
      'The card shows the Plus tile, "daily.dev Plus" and the Get Plus button.',
      'With the panel open, the same card sits at the panel\'s foot, above Feedback, and replaces the You panel\'s "Get Plus" row.',
      'Closing it hides it for a while, then it comes back.',
    ],
    tradeOff:
      'It covers the corner of the first feed column, and once closed it is gone until it returns.',
  },
  {
    id: 'floating-pill',
    title: 'C. Floating Get Plus button',
    summary:
      'Only the Get Plus button, floating in the same bottom-left spot, with a close button.',
    details: [
      'The lightest option: one button, no card.',
      'With the panel open, it stays where it is and the You panel keeps its "Get Plus" row.',
    ],
    tradeOff: 'With no copy, it relies on people already knowing what Plus is.',
  },
];

const meta: Meta<typeof V2Shell> = {
  title: 'Experiments/Layout V2 Get Plus',
  component: V2Shell,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    plus: {
      control: 'inline-radio',
      options: ['rail-pill', 'floating-card', 'floating-pill', 'panel-card'],
    },
    panel: { control: 'inline-radio', options: ['none', 'explore', 'you'] },
    isPlus: { control: 'boolean' },
    widgets: { control: 'boolean' },
    showMarkers: { control: 'boolean' },
    height: { control: { type: 'range', min: 560, max: 1000, step: 20 } },
  },
  args: {
    variant: 'proposed',
    panel: 'none',
    isPlus: false,
    height: 820,
    width: 1280,
    showMarkers: false,
  },
};

export default meta;

type Story = StoryObj<typeof V2Shell>;

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default p-8 text-text-primary">
    {children}
  </div>
);

const Caption = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="mb-2 font-bold uppercase tracking-wider text-text-tertiary typo-caption1">
    {children}
  </div>
);

// Scales the full-size shell down rather than drawing a small one, so every
// state shows exactly what the full-size story shows.
const Scaled = ({
  scale,
  height,
  children,
}: {
  scale: number;
  height: number;
  children: ReactNode;
}): ReactElement => (
  <div
    className="shrink-0 overflow-hidden rounded-16"
    style={{ width: 1280 * scale, height: height * scale }}
  >
    <div style={{ zoom: scale }}>{children}</div>
  </div>
);

const OptionRow = ({
  option,
  args,
  scale,
}: {
  option: Option;
  args: ShellProps;
  scale: number;
}): ReactElement => {
  const height = args.height ?? 820;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-bold typo-title3">{option.title}</h2>
        <p className="max-w-3xl text-text-secondary typo-callout">
          {option.summary}
        </p>
      </div>
      <div className="flex items-start gap-6">
        <div>
          <Caption>Default: panel collapsed</Caption>
          <Scaled scale={scale} height={height}>
            <V2Shell {...args} plus={option.id} panel="none" />
          </Scaled>
        </div>
        <div>
          <Caption>Panel open</Caption>
          <Scaled scale={scale} height={height}>
            <V2Shell {...args} plus={option.id} panel="explore" />
          </Scaled>
        </div>
        <div className="flex w-64 shrink-0 flex-col gap-3 pt-6">
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-secondary typo-footnote">
            {option.details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="text-text-tertiary typo-footnote">
            <strong className="text-text-secondary">Trade-off: </strong>
            {option.tradeOff}
          </p>
        </div>
      </div>
    </section>
  );
};

export const Overview: Story = {
  render: (args) => (
    <Page>
      <div className="flex flex-col gap-10">
        <header className="flex max-w-3xl flex-col gap-2">
          <h1 className="font-bold typo-title1">
            Get Plus, visible by default
          </h1>
          <p className="text-text-secondary typo-body">
            Today the only Get Plus entry on desktop v2 is the first row of the
            You panel, and the panel is collapsed by default, so most people
            never see it. Plus visits fell from 6.5% to 0.9%. Each option below
            puts the button where it shows without any hover or click.
          </p>
          <p className="text-text-tertiary typo-footnote">
            Drawn on the production v2 shell: the rail, the panel with its
            Feedback widget, the floating page card, and the home header strip
            with its chip tabs and icon actions, using the production Button.
            Recommended: A. It is on every page, never covers content, and needs
            no dismiss state.
          </p>
        </header>
        {OPTIONS.map((option) => (
          <OptionRow key={option.id} option={option} args={args} scale={0.42} />
        ))}
      </div>
    </Page>
  ),
};

const optionStory = (index: number): Story => {
  const option = OPTIONS[index];
  return {
    name: option.title,
    args: { plus: option.id },
    render: (args) => (
      <Page>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold typo-title3">{option.title}</h2>
            <p className="max-w-3xl text-text-secondary typo-callout">
              {option.summary}
            </p>
          </div>
          <V2Shell {...args} />
        </div>
      </Page>
    ),
  };
};

export const RailButton = optionStory(0);
export const FloatingCard = optionStory(1);
export const FloatingButton = optionStory(2);

export const PlusMember: Story = {
  name: 'Plus member',
  args: { isPlus: true, plus: 'rail-pill' },
  render: (args) => (
    <Page>
      <p className="mb-3 text-text-tertiary typo-callout">
        Members see none of these: Invite keeps its rail slot, nothing floats,
        and the shield is the on/off toggle.
      </p>
      <V2Shell {...args} />
    </Page>
  ),
};
