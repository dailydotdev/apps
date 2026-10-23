import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PlusPlacement, ShellProps } from './shell';
import { V2Shell } from './shell';

// Six ways to make Plus visible on the v2 desktop shell without adding
// another "Get Plus" button: Plus becomes part of the brand, a setting, a
// meter, a switch, a feed, or a preview. Today the only entry is the first
// row of the You panel, collapsed by default (Plus visits 6.5% → 0.9%).

interface Idea {
  id: PlusPlacement;
  title: string;
  simple: boolean;
  summary: string;
  inspiredBy: string;
  tradeOff: string;
  // Extra states to draw beside the default one.
  states?: { label: string; args: Partial<ShellProps> }[];
}

const IDEAS: Idea[] = [
  {
    id: 'logo-plus',
    title: '1. daily.dev+',
    simple: true,
    summary:
      'The logo gets a small "+". For non-members it is an outline and opens Plus; for members it fills in. Nothing else on the page changes.',
    inspiredBy:
      'Brands that put the plan in the name: Disney+, Apple TV+, iCloud+.',
    tradeOff:
      'It is quiet. People need to learn the "+" is clickable, so it wants a tooltip on first hover.',
    states: [{ label: 'Plus member', args: { isPlus: true } }],
  },
  {
    id: 'plus-switch',
    title: '2. Plus is a switch',
    simple: true,
    summary:
      'At the bottom of the rail, a switch labeled Plus, set to off. Turning it on opens checkout. Plus reads as a setting you turn on, not an ad.',
    inspiredBy: 'iOS Settings, where iCloud+ features are rows you switch on.',
    tradeOff:
      'The switch cannot really turn Plus on by itself, so the checkout step must be obvious. It takes the Invite slot (Invite moves to the "?" menu).',
  },
  {
    id: 'ad-switch',
    title: '3. A switch on the ad',
    simple: true,
    summary:
      'Every ad in the feed carries its own "Ads: off with Plus" switch. The way to Plus is right where the ad is.',
    inspiredBy: 'YouTube\'s "Skip ads with Premium" on the ad itself.',
    tradeOff:
      'It only shows to people who see ads, and it adds a row to the ad card.',
  },
  {
    id: 'free-meter',
    title: '4. Free has a meter',
    simple: false,
    summary:
      "At the bottom of the rail, a ring showing what is left of this month's free allowance (Clickbait Shield: 3 of 5 left). Plus has no meter.",
    inspiredBy:
      'The usage meters in Cursor and Claude; the data bar on a phone plan.',
    tradeOff:
      'It only means something to people who use the shield. It takes the Invite slot.',
  },
  {
    id: 'plus-tab',
    title: '5. Plus is a feed',
    simple: false,
    summary:
      'A "Plus" tab at the end of the feed tabs, where people already switch between For you, Following and their own feeds. It opens your feed as a member sees it.',
    inspiredBy:
      "Spotify's Premium tab in its app navigation; YouTube's Premium entry in its guide.",
    tradeOff: 'It is one more tab in a busy row.',
  },
  {
    id: 'preview-toggle',
    title: '6. Preview Plus',
    simple: false,
    summary:
      'A "Preview Plus" switch in the feed header. Flip it and your own feed renders the way a member sees it: the ad leaves, a bar offers to keep it.',
    inspiredBy:
      'Canva and Grammarly, which show paid results on your own work before you pay.',
    tradeOff:
      'The client has to render the member experience for a free user for a moment, clean titles included.',
    states: [{ label: 'Switched on', args: { plusActive: true } }],
  },
];

const meta: Meta<typeof V2Shell> = {
  title: 'Experiments/Layout V2 Get Plus',
  component: V2Shell,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    plus: { control: 'select', options: IDEAS.map((idea) => idea.id) },
    panel: { control: 'inline-radio', options: ['none', 'explore', 'you'] },
    isPlus: { control: 'boolean' },
    plusActive: { control: 'boolean' },
    widgets: { control: 'boolean' },
    height: { control: { type: 'range', min: 560, max: 1000, step: 20 } },
  },
  args: {
    variant: 'proposed',
    panel: 'none',
    isPlus: false,
    plusActive: false,
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
// thumbnail shows exactly what the full-size story shows.
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

const IdeaNotes = ({ idea }: { idea: Idea }): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2">
      <h2 className="font-bold typo-title3">{idea.title}</h2>
      {idea.simple && (
        <span className="rounded-6 bg-surface-float px-1.5 text-text-secondary typo-caption1">
          Simple
        </span>
      )}
    </div>
    <p className="text-text-secondary typo-callout">{idea.summary}</p>
    <p className="text-text-tertiary typo-footnote">
      <strong className="text-text-secondary">Inspired by: </strong>
      {idea.inspiredBy}
    </p>
    <p className="text-text-tertiary typo-footnote">
      <strong className="text-text-secondary">Trade-off: </strong>
      {idea.tradeOff}
    </p>
  </div>
);

const IdeaRow = ({
  idea,
  args,
  scale,
}: {
  idea: Idea;
  args: ShellProps;
  scale: number;
}): ReactElement => {
  const height = args.height ?? 820;
  const states = [{ label: 'Default', args: {} }, ...(idea.states ?? [])];
  return (
    <section className="flex items-start gap-8">
      <div className="flex gap-6">
        {states.map((state) => (
          <div key={state.label}>
            <Caption>{state.label}</Caption>
            <Scaled scale={scale} height={height}>
              <V2Shell {...args} plus={idea.id} {...state.args} />
            </Scaled>
          </div>
        ))}
      </div>
      <div className="w-80 shrink-0 pt-6">
        <IdeaNotes idea={idea} />
      </div>
    </section>
  );
};

export const Overview: Story = {
  render: (args) => (
    <Page>
      <div className="flex flex-col gap-12">
        <header className="flex max-w-3xl flex-col gap-2">
          <h1 className="font-bold typo-title1">Plus without another button</h1>
          <p className="text-text-secondary typo-body">
            Plus visits fell from 6.5% to 0.9% in v2 because the only entry sits
            in a panel that is collapsed by default. Instead of finding a new
            spot for a &quot;Get Plus&quot; button, each idea makes Plus part of
            something already on screen: the logo, a setting, the ad, a meter,
            the feed tabs, or the feed itself. The first three are the simplest.
          </p>
          <p className="text-text-tertiary typo-footnote">
            Drawn on the production v2 shell with the production Button and
            Switch.
          </p>
        </header>
        {IDEAS.map((idea) => (
          <IdeaRow key={idea.id} idea={idea} args={args} scale={0.42} />
        ))}
      </div>
    </Page>
  ),
};

const ideaStory = (index: number): Story => {
  const idea = IDEAS[index];
  return {
    name: idea.title,
    args: { plus: idea.id },
    render: (args) => (
      <Page>
        <div className="flex items-start gap-8">
          <V2Shell {...args} />
          <div className="w-72 shrink-0">
            <IdeaNotes idea={idea} />
          </div>
        </div>
      </Page>
    ),
  };
};

export const DailyDevPlus = ideaStory(0);
export const PlusSwitch = ideaStory(1);
export const AdSwitch = ideaStory(2);
export const FreeMeter = ideaStory(3);
export const PlusTab = ideaStory(4);
export const PreviewPlus = ideaStory(5);
