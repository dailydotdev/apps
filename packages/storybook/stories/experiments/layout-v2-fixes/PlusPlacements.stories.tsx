import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PanelId, PlusPlacement, ShellProps } from './shell';
import { V2Shell } from './shell';

// Five alternatives to the panel card for where a non-member meets Plus on the
// v2 desktop shell. Plus visits fell 6.5% → 0.9% in the layout_v2_reboot read
// because the only entry left is the first row of the You panel.

interface Placement {
  id: PlusPlacement;
  title: string;
  pitch: string;
  inspiredBy: string;
  sells: string;
  how: string[];
  cost: string;
  risk: string;
  panel: PanelId;
  plusOpen: boolean;
}

const PLACEMENTS: Placement[] = [
  {
    id: 'rail',
    title: '1. A Plus slot on the rail',
    pitch: 'Always visible, on every page, for the price of one icon.',
    inspiredBy:
      "X's Premium entry in its side nav; Discord's Nitro tab in the DM list.",
    sells: 'The whole plan.',
    how: [
      'Plus takes the Invite slot in the rail\'s bottom trio, in the Plus color. Invite moves into the Support ("?") menu.',
      'Hover opens the same Plus preview the "Get Plus" row uses today.',
      'Members see Invite back in its slot.',
    ],
    cost: 'No rail height: a new row would fold the Streak tab into "More" at 820px.',
    risk: 'Referrals lose their one-click entry on the rail.',
    panel: 'none',
    plusOpen: true,
  },
  {
    id: 'avatar',
    title: '2. Your plan, on your avatar',
    pitch: 'Plus becomes part of who you are on daily.dev, not an ad for it.',
    inspiredBy:
      'GitHub\'s account menu naming your plan next to "Upgrade"; LinkedIn\'s "Try Premium" under your name; status rings around avatars.',
    sells: 'Status, plus the three perks people use most.',
    how: [
      'Non-members get a small Plus notch on the rail avatar.',
      'The You panel\'s identity block names the plan ("Free plan") with an Upgrade strip beneath it. It replaces the "Get Plus" row.',
      'Members get a Plus ring around their avatar and "Plus member" under their name.',
    ],
    cost: 'Zero height. The avatar is pinned and never folds.',
    risk: 'A notch on the avatar can read as a notification. It needs a quiet treatment and should not pulse.',
    panel: 'you',
    plusOpen: false,
  },
  {
    id: 'shield',
    title: '3. Let Clickbait Shield sell itself',
    pitch: 'Show the perk working on posts you are about to read.',
    inspiredBy:
      "Grammarly's premium suggestions shown inside your own text; Notion AI's inline previews; Spotify's Smart Shuffle trial.",
    sells: 'AI-powered clean titles: Clickbait Shield.',
    how: [
      'The shield is already in the v2 header strip as an icon with "3/5" free tries. Here it opens into a "Clean titles 3/5" pill.',
      'A post whose title the shield rewrote carries a "Clean title" chip, with the original crossed out above it.',
      'Hovering the pill shows what the shield did today and what Plus keeps on.',
    ],
    cost: 'No new surface: it uses a button that already ships.',
    risk: 'It only sells while free tries last, so the before/after needs tries left, or one sample title, to work.',
    panel: 'none',
    plusOpen: true,
  },
  {
    id: 'widget',
    title: "4. Plus in the ad's place",
    pitch: 'Sell ad-free exactly where the ad would be.',
    inspiredBy:
      'YouTube\'s "Skip ads with Premium"; Spotify\'s ad breaks offering Premium; the iOS widget gallery.',
    sells: 'Ad-free experience.',
    how: [
      'The new feed widget rail (feed_widgets) keeps one slot for an ad, and daily.dev tips already take it over sometimes (#7004).',
      'Some of those turns show a Plus tile instead: "This spot runs an ad. On Plus it doesn\'t."',
      'It sits beside Customize, so it reads as part of a home page the reader built.',
    ],
    cost: 'One ad impression each time it shows; the rotation sets the price.',
    risk: 'The widget rail is behind a flag that is off by default, so this only reaches readers who have it.',
    panel: 'none',
    plusOpen: false,
  },
  {
    id: 'quests',
    title: "5. A reward you can't claim yet",
    pitch: 'Ask at the moment someone has already earned something.',
    inspiredBy:
      "Duolingo's Super-only rewards; the premium track of a game battle pass.",
    sells: 'Plus quests and bonus quest slots.',
    how: [
      'Plus quests already appear in the v2 quest list, and a finished one already says "Claim with Plus" (#6968), but only inside the panel.',
      'When one finishes, the Streak tab gets a Plus lock badge, so the moment shows on the rail.',
      'The row shows the reward waiting, next to "Claim with Plus".',
    ],
    cost: 'Zero height; a badge on a tab that is already there.',
    risk: 'It fires only when a Plus quest completes, so reach depends on how often Plus quests are rolled. Quest claims are up 60% in v2, so the audience is there.',
    panel: 'streak',
    plusOpen: false,
  },
];

const meta: Meta<typeof V2Shell> = {
  title: 'Experiments/Layout V2 Plus placements',
  component: V2Shell,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    plus: {
      control: 'select',
      options: ['panel-card', 'rail', 'avatar', 'shield', 'widget', 'quests'],
    },
    panel: {
      control: 'inline-radio',
      options: ['explore', 'you', 'streak', 'none'],
    },
    isPlus: { control: 'boolean' },
    plusOpen: { control: 'boolean' },
    widgets: { control: 'boolean' },
    showMarkers: { control: 'boolean' },
    height: { control: { type: 'range', min: 560, max: 1000, step: 20 } },
  },
  args: {
    variant: 'proposed',
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

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <span className="font-bold uppercase tracking-wider text-text-quaternary typo-caption2">
      {label}
    </span>
    <span className="text-text-secondary typo-footnote">{children}</span>
  </div>
);

const Notes = ({ placement }: { placement: Placement }): ReactElement => (
  <aside className="flex w-72 shrink-0 flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{placement.title}</h2>
      <p className="text-text-secondary typo-callout">{placement.pitch}</p>
    </div>
    <Field label="Inspired by">{placement.inspiredBy}</Field>
    <Field label="Sells">{placement.sells}</Field>
    <Field label="How it works">
      <ul className="flex list-disc flex-col gap-1 pl-4">
        {placement.how.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </Field>
    <Field label="Rail cost">{placement.cost}</Field>
    <Field label="Risk">{placement.risk}</Field>
  </aside>
);

const shellArgsFor = (placement: Placement): Partial<ShellProps> => ({
  plus: placement.id,
  panel: placement.panel,
  plusOpen: placement.plusOpen,
});

const placementStory = (index: number): Story => {
  const placement = PLACEMENTS[index];
  return {
    name: placement.title,
    args: shellArgsFor(placement),
    render: (args) => (
      <Page>
        <div className="flex items-start gap-8">
          <V2Shell {...args} />
          <Notes placement={placement} />
        </div>
      </Page>
    ),
  };
};

// Thumbnails scale the full-size shell down rather than drawing a small one,
// so the overview shows exactly what each story shows.
const THUMB_SCALE = 0.42;

export const Overview: Story = {
  name: 'Overview',
  render: (args) => (
    <Page>
      <div className="mx-auto flex max-w-[76rem] flex-col gap-8">
        <header className="flex max-w-3xl flex-col gap-2">
          <h1 className="font-bold typo-title1">Where non-members meet Plus</h1>
          <p className="text-text-secondary typo-body">
            Plus visits fell from 6.5% to 0.9% in v2. The only entry left is the
            first row of the You panel, and that panel is collapsed by default,
            so most people never see it. These are five alternatives to the
            panel card. Each one is tied to a real Plus perk and sits on a
            surface v2 already gets people to.
          </p>
          <p className="text-text-tertiary typo-footnote">
            One constraint shaped all five: at an 820px-tall viewport the rail
            has about 40px to spare. Any new rail row, even a bare icon, folds
            the Streak tab into &quot;More&quot;, and Streak drives the +60% in
            quest claims. So none of these adds a row.
          </p>
        </header>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {PLACEMENTS.map((placement) => (
            <article key={placement.id} className="flex flex-col gap-3">
              <div
                className="overflow-hidden rounded-16"
                style={{
                  width: 1280 * THUMB_SCALE,
                  height: (args.height ?? 820) * THUMB_SCALE,
                }}
              >
                <div style={{ zoom: THUMB_SCALE }}>
                  <V2Shell {...args} {...shellArgsFor(placement)} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-bold typo-title3">{placement.title}</h2>
                <p className="text-text-secondary typo-callout">
                  {placement.pitch}
                </p>
                <p className="text-text-tertiary typo-footnote">
                  Sells: {placement.sells} Inspired by: {placement.inspiredBy}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Page>
  ),
};

export const RailSlot = placementStory(0);
export const AvatarPlan = placementStory(1);
export const ShieldSellsItself = placementStory(2);
export const AdSlotWidget = placementStory(3);
export const LockedQuestReward = placementStory(4);

export const PlusMember: Story = {
  name: 'Plus member (all placements quiet)',
  args: { isPlus: true, plus: 'avatar', panel: 'you' },
  render: (args) => (
    <Page>
      <p className="mb-3 text-text-tertiary typo-callout">
        Members see none of the upsells: Invite keeps its rail slot, the shield
        is the on/off toggle, and the avatar gets the Plus ring instead.
      </p>
      <V2Shell {...args} />
    </Page>
  ),
};
