import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PanelId, PlusPlacement, ShellProps } from './shell';
import { V2Shell } from './shell';

// Ten places a non-member could see "Get Plus" on the v2 desktop shell with
// no hover or click. Today its only entry is the first row of the You panel,
// and the panel is collapsed by default (Plus visits 6.5% → 0.9% in the
// layout_v2_reboot read).

interface Idea {
  id: PlusPlacement;
  title: string;
  summary: string;
  inspiredBy: string;
  tradeOff: string;
  panel?: PanelId;
  widgets?: boolean;
}

const IDEAS: Idea[] = [
  {
    id: 'rail-button',
    title: '1. Plus button on the rail',
    summary:
      'A filled Plus button in the rail\'s bottom group, in the Invite slot. Invite moves into the "?" menu.',
    inspiredBy:
      "X's Premium item in its side nav; Discord's Nitro entry in the DM list.",
    tradeOff: 'Invite loses its one-click spot.',
  },
  {
    id: 'logo-chip',
    title: '2. Chip under the logo',
    summary:
      'A small "Get Plus" chip right under the daily.dev logo, at the top of the rail on every page.',
    inspiredBy:
      'The "Get Plus" button at the top of ChatGPT; Spotify\'s "Explore Premium" in its top bar.',
    tradeOff:
      'It adds 26px to the rail. At 820px tall that still fits, but on shorter screens one tab folds into "More" sooner.',
  },
  {
    id: 'avatar-tag',
    title: '3. Tag under your avatar',
    summary:
      'Under "You" on the rail, a small "Get Plus" tag, the way apps name your plan next to your account.',
    inspiredBy:
      'Claude.ai and Figma, which show your plan next to your name or team.',
    tradeOff: 'It is small, and it adds 18px to the pinned avatar row.',
  },
  {
    id: 'edge-tab',
    title: '4. Tab on the sidebar edge',
    summary:
      'A vertical "Get Plus" tab tucked against the sidebar\'s right edge. It follows the edge when the panel opens.',
    inspiredBy:
      'The feedback side tabs from Hotjar and Usabilla, pinned to the edge of the page.',
    tradeOff: 'It reads as a widget more than part of the product.',
  },
  {
    id: 'corner-card',
    title: '5. Card in the bottom-left corner',
    summary:
      'A small Plus card floating beside the rail while the panel is collapsed. Opening the panel docks it into the panel.',
    inspiredBy:
      'The upgrade card at the bottom of the Notion and Perplexity sidebars.',
    tradeOff:
      'It covers the corner of the first feed column until it is closed.',
  },
  {
    id: 'top-banner',
    title: '6. Banner above the page',
    summary:
      'A slim, closable Plus banner above the page card, in the slot MainLayout already keeps for a top banner.',
    inspiredBy: "Slack's and GitHub's account banners at the top of the app.",
    tradeOff: 'Banners are easy to tune out, and it pushes the feed down.',
  },
  {
    id: 'bottom-bar',
    title: '7. Bar at the bottom of the feed',
    summary:
      'A closable "You\'re on Free" bar pinned to the bottom of the page card, where the logged-out sponsor dock sits.',
    inspiredBy:
      "Spotify's bar along the bottom of its web player for free listeners.",
    tradeOff: 'It takes a strip of the feed on every page until closed.',
  },
  {
    id: 'feed-card',
    title: '8. Card in the feed',
    summary:
      'A Plus card the size of a post, in the first row of the feed, as a card people scroll past.',
    inspiredBy:
      'X\'s "Subscribe to Premium" card; LinkedIn\'s Premium cards in the feed.',
    tradeOff: 'It takes a post slot, and only shows on feed pages.',
  },
  {
    id: 'panel-open',
    title: '9. Panel open, Plus on top',
    summary:
      'For new non-members the sidebar panel starts open, with a Plus card right under its title.',
    inspiredBy:
      'Notion and Perplexity, whose sidebars start open with the upgrade inside.',
    tradeOff:
      'It changes the default sidebar state, and the content area gets narrower.',
    panel: 'explore',
  },
  {
    id: 'greeting',
    title: '10. Next to the greeting',
    summary:
      'In the feed widget rail, a "Get Plus" button beside Customize, on the "Good morning" row.',
    inspiredBy: 'Duolingo, which keeps "Try Super" beside your daily progress.',
    tradeOff:
      'Only readers with the widget rail (feed_widgets, off by default) see it.',
    widgets: true,
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

const ideaArgs = (idea: Idea): Partial<ShellProps> => ({
  plus: idea.id,
  panel: idea.panel ?? 'none',
  widgets: idea.widgets ?? false,
});

const IdeaNotes = ({ idea }: { idea: Idea }): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <h2 className="font-bold typo-title3">{idea.title}</h2>
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

// Thumbnails scale the full-size shell down rather than drawing a small one,
// so the overview shows exactly what each story shows.
const THUMB_SCALE = 0.45;

export const Overview: Story = {
  render: (args) => (
    <Page>
      <div className="mx-auto flex max-w-[78rem] flex-col gap-10">
        <header className="flex max-w-3xl flex-col gap-2">
          <h1 className="font-bold typo-title1">
            Ten places for Get Plus, visible by default
          </h1>
          <p className="text-text-secondary typo-body">
            Today the only Get Plus entry on desktop v2 is the first row of the
            You panel, and the panel is collapsed by default, so most people
            never see it. Plus visits fell from 6.5% to 0.9%. Each idea below
            shows Get Plus without any hover or click, and each borrows from how
            another product puts its upgrade in view.
          </p>
          <p className="text-text-tertiary typo-footnote">
            Drawn on the production v2 shell with the production Button. Open
            any idea on its own for the full-size view and the controls.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-x-10 gap-y-12">
          {IDEAS.map((idea) => (
            <article key={idea.id} className="flex flex-col gap-3">
              <div
                className="overflow-hidden rounded-16"
                style={{
                  width: 1280 * THUMB_SCALE,
                  height: (args.height ?? 820) * THUMB_SCALE,
                }}
              >
                <div style={{ zoom: THUMB_SCALE }}>
                  <V2Shell {...args} {...ideaArgs(idea)} />
                </div>
              </div>
              <IdeaNotes idea={idea} />
            </article>
          ))}
        </div>
      </div>
    </Page>
  ),
};

const ideaStory = (index: number): Story => {
  const idea = IDEAS[index];
  return {
    name: idea.title,
    args: ideaArgs(idea),
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

export const RailButton = ideaStory(0);
export const LogoChip = ideaStory(1);
export const AvatarTag = ideaStory(2);
export const EdgeTab = ideaStory(3);
export const CornerCard = ideaStory(4);
export const TopBanner = ideaStory(5);
export const BottomBar = ideaStory(6);
export const FeedCard = ideaStory(7);
export const PanelOpen = ideaStory(8);
export const Greeting = ideaStory(9);
