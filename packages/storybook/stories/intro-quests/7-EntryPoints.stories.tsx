import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { Scenario } from './sim';
import { SimProvider, scenarioLabels } from './sim';
import { CardsFinal } from './finalists/CardsFinal';
import { ChecklistFinal } from './finalists/ChecklistFinal';
import { JourneyFinal } from './finalists/JourneyFinal';
import type { Layout, PanelComponent } from './entry/EntryPoints';
import {
  AvatarEntry,
  FloatingEntry,
  HeaderEntry,
  RailEntry,
  StripEntry,
} from './entry/EntryPoints';
import { EntryStage } from './entry/layouts';

type PanelName = 'cards' | 'checklist' | 'journey';

interface Args {
  scenario: Scenario;
  panel: PanelName;
  layout: Layout;
}

const panels: Record<PanelName, PanelComponent> = {
  cards: CardsFinal,
  checklist: ChecklistFinal,
  journey: JourneyFinal,
};

const meta: Meta<Args> = {
  title: 'Intro Quests/7. Entry points',
  parameters: { layout: 'fullscreen' },
  args: { scenario: 'midway', panel: 'cards', layout: 'rail' },
  argTypes: {
    scenario: {
      control: 'select',
      options: Object.keys(scenarioLabels),
      labels: scenarioLabels,
    },
    panel: {
      control: 'inline-radio',
      options: ['cards', 'checklist', 'journey'],
      labels: {
        cards: 'Action cards',
        checklist: 'Checklist',
        journey: 'Journey trail',
      },
    },
    layout: {
      control: 'inline-radio',
      options: ['classic', 'rail'],
      labels: { classic: 'Classic layout', rail: 'New layout (rail)' },
    },
  },
};

export default meta;

type Story = StoryObj<Args>;

interface EntryInfo {
  number: number;
  name: string;
  where: string;
  thesis: string;
  tradeoff: string;
  render: (Panel: PanelComponent, layout: Layout) => ReactElement;
  usesLayout?: boolean;
}

const EntryFrame = ({
  info,
  args,
}: {
  info: EntryInfo;
  args: Args;
}): ReactElement => {
  const [run, setRun] = useState(0);

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-background-default px-6 py-8 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[80rem] flex-col gap-5">
        <header className="flex flex-col gap-3 laptop:flex-row laptop:items-end laptop:justify-between">
          <div className="flex max-w-[46rem] flex-col gap-1">
            <p className="font-bold text-text-tertiary typo-footnote">
              Entry point {info.number} · {info.where}
            </p>
            <h1 className="font-bold typo-title2">{info.name}</h1>
            <p className="text-text-secondary typo-callout">{info.thesis}</p>
            <p className="text-text-tertiary typo-footnote">
              Trade-off: {info.tradeoff}
            </p>
            <p className="text-text-quaternary typo-footnote">
              Click the trigger to close and reopen it. Change the opened
              finalist with the Panel control
              {info.usesLayout ? ', and the layout with Layout' : ''}.
            </p>
          </div>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => setRun((value) => value + 1)}
          >
            Reset scenario
          </Button>
        </header>
        <SimProvider key={`${args.scenario}-${run}`} scenario={args.scenario}>
          <EntryStage>
            {info.render(panels[args.panel], args.layout)}
          </EntryStage>
        </SimProvider>
      </div>
    </div>
  );
};

const entry = (info: EntryInfo): Story => ({
  name: `${info.number} · ${info.name}`,
  render: (args) => <EntryFrame info={info} args={args} />,
});

export const Header = entry({
  number: 1,
  name: 'Header, top right',
  where: 'Classic layout',
  thesis:
    'Where people look for account things, next to New post and the bell. A calm chip with a progress ring and "2/6" replaces the shaking "Get the most out of daily.dev" button. The panel drops straight down from it.',
  tradeoff:
    'Competes with New post and notifications for the same corner. The new layout has no global header, so it needs one of the other options there.',
  render: (Panel) => <HeaderEntry Panel={Panel} />,
});

export const Strip = entry({
  number: 2,
  name: 'Page header, top right',
  where: 'New layout',
  thesis:
    'The new layout’s top: the right end of the feed’s page header strip, where the button already sits today in v2. Same ring chip, a clearer label, and the panel opens under it.',
  tradeoff:
    'Only exists on feed pages. Leave the feed and setup disappears until you come back.',
  render: (Panel) => <StripEntry Panel={Panel} />,
});

export const Rail = entry({
  number: 3,
  name: 'Rail, next to Support',
  where: 'New layout',
  thesis:
    'A ring around the setup icon in the rail’s bottom cluster, above Invite and Support, with a count of steps left. It opens like Support does: a popup to the right of the rail, anchored to the bottom.',
  tradeoff:
    'Visible on every page and never in the way, but the bottom of the rail is where people look last. It relies on the ring and the claim dot to get noticed.',
  render: (Panel) => <RailEntry Panel={Panel} />,
});

export const Floating = entry({
  number: 4,
  name: 'Floating pill, bottom right',
  where: 'Both layouts',
  thesis:
    'An Intercom-style launcher in the corner. Always there, works the same in both layouts, and collapses to a pill while you read.',
  tradeoff:
    'Floats over feed cards and fights the support chat, cookie banner and toasts for the same corner. Easy to learn to ignore.',
  render: (Panel, layout) => <FloatingEntry Panel={Panel} layout={layout} />,
  usesLayout: true,
});

export const Avatar = entry({
  number: 5,
  name: 'Ring around your avatar',
  where: 'Both layouts',
  thesis:
    'Setup is about you, so the progress ring wraps your avatar, LinkedIn style. Opening the avatar menu shows "Finish setting up" as its first item, which opens the panel.',
  tradeoff:
    'The quietest option and costs no new button, but it takes two clicks and the ring alone may not read as a to-do.',
  render: (Panel, layout) => <AvatarEntry Panel={Panel} layout={layout} />,
  usesLayout: true,
});
