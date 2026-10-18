import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Mono,
  Page,
  PageHeader,
  PhoneFrame,
  Section,
  Table,
} from '../shell';
import { PhoneShell, Post, ProductShell } from '../delivery/product';
import {
  BellDropdown,
  CaughtUpDivider,
  FloatingPack,
  HeaderBell,
  HighlightCard,
  MobileStrip,
  MondayPrompt,
  NativeCard,
  PackTile,
  RecapBanner,
  ReplayPopup,
  StoryBubble,
  StoryRing,
  StripEntry,
  WeeklySnapshot,
  WrappedPill,
} from './entry';
import { Inspiration } from './concepts';

const meta: Meta = {
  title: 'Replay delivery/00c. Entry points to the pop-up',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The cards live in the pop-up deck. The feed only needs a door. Twelve doors, each rendered in the product, each one opening the same deck when clicked.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Door = ({
  number,
  title,
  from,
  description,
  children,
  why,
  risk,
}: {
  number: number;
  title: string;
  from: string;
  description: string;
  children: ReactNode;
  why: string;
  risk: string;
}): ReactElement => (
  <Section title={`${number} · ${title}`} description={description}>
    {children}
    <Inspiration>{from}</Inspiration>
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="Why it works">
        <p>{why}</p>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="Risk">
        <p>{risk}</p>
      </Callout>
    </div>
  </Section>
);

export const Desktop: Story = {
  name: 'Twelve doors, desktop',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
        <PageHeader eyebrow="Replay delivery · entry points" title="The feed only needs a door">
          <p>
            The cards open in the pop-up: the deck from <Mono>13. The deck</Mono>,
            drag a card and it goes to the back, the feed dimmed behind it. So the
            question for the feed is smaller and sharper: what makes someone
            click? Twelve answers, each borrowed from a product that gets people
            into a personal recap, each rendered in the real feed. Click any of
            them; they all open the same pop-up.
          </p>
        </PageHeader>

        <Door
          number={1}
          title="The sealed pack"
          from="Pokémon TCG Pocket · Duolingo's reward chest"
          description="One slot, the pack breathing in it, the handle on it. The pack is the button; the tear happens as the pop-up opens."
          why="Nothing else in the feed is sealed or has their name on it. The foil already says something about the week, and a wrapped thing invites a hand."
          risk="Reads as gaming to some developers. The quiet foil variant exists for that; and it costs a slot."
        >
          <ProductShell count={5} slots={[{ at: 0, node: <PackTile onOpen={go} /> }]} />
        </Door>

        <Door
          number={2}
          title="The strip"
          from="Spotify's Wrapped pill at the top of Home · Steam Replay's storefront banner"
          description="One row above the feed with the mini pack and the claim. The one you liked. All week, no slot."
          why="It says the most interesting true thing about the person in the first line of the page and asks for nothing but a click. It survives Tuesday to Sunday without wearing out."
          risk="Banner blindness by week three unless the claim changes every week, which it does."
        >
          <ProductShell count={6} above={<StripEntry onOpen={go} />} />
        </Door>

        <Door
          number={3}
          title="The pill"
          from="Spotify Wrapped: a small coloured pill at the very top of Home that opens the hub"
          description="Smaller than the strip: a gradient pill in the tabs row, next to For you. Persistent, tiny, coloured like nothing else on the page."
          why="Spotify keeps Wrapped one tap away for weeks with a pill this size. It never takes a row, it is always there, and the colour is the whole signal."
          risk="No claim, so no curiosity beyond the colour. Best paired with the notification row that does carry the claim."
        >
          <ProductShell count={6} tabsChildren={<WrappedPill onOpen={go} />} />
        </Door>

        <Door
          number={4}
          title="The highlight"
          from="Apple Music Replay's 'Your music story is here' highlight · Spotify's desktop banner"
          description="Two slots wide, the claim at poster size, the cards stacked like cover art, a Play button. Monday only."
          why="A play button on a personal thing is the strongest verb in media apps, and the cover-art stack says there is more than one card without showing them."
          risk="It is a takeover of a third of the first row. Monday only, and never twice for the same person."
        >
          <ProductShell count={5} slots={[{ at: 0, span: 2, node: <HighlightCard onOpen={go} /> }]} />
        </Door>

        <Door
          number={5}
          title="The weekly snapshot"
          from="Strava's weekly training snapshot at the top of the feed, with 'See more'"
          description="Numbers first, the Replay as the door. Four figures in a row and the claim; the cards are one click further."
          why="Strava puts the week's totals above the feed and people check them daily. The numbers are the hook; the cards are the payoff behind them."
          risk="Shows the receipt before the story. If the numbers are ordinary the door looks ordinary too; the claim in the first line carries it."
        >
          <ProductShell count={6} above={<WeeklySnapshot onOpen={go} />} />
        </Door>

        <Door
          number={6}
          title="The story ring"
          from="Instagram stories · Year in Monzo pinned to the top of Home as a story"
          description="A gradient ring around the avatar in the header, and the tray version under the tabs. The ring means 'there is something of yours to watch'."
          why="Every developer knows what a ring around an avatar means. It costs nothing, it is theirs, and the tray version shows the pack inside it."
          risk="Easy to miss in the header alone, and the tray is a full row for one bubble until there is more than one weekly story to show."
        >
          <ProductShell count={6} headerRight={<StoryRing onOpen={go} />} above={<div className="flex gap-5 px-1"><StoryBubble onOpen={go} /></div>} />
        </Door>

        <Door
          number={7}
          title="The banner"
          from="Reddit Recap's banner at the top of the feed, with a close · YouTube Recap's shelf"
          description="Loud, wide, coloured, closable. Cards peeking out, the claim, a white button. Once a week, gone on close."
          why="The loudest honest option: it does not take a slot, it does not interrupt, it just cannot be missed. Reddit and YouTube both ship this shape."
          risk="The closest to marketing. Earns a close from people who dislike banners; the strip is what it becomes after that."
        >
          <ProductShell count={6} above={<RecapBanner onOpen={go} />} />
        </Door>

        <Door
          number={8}
          title="The Monday prompt"
          from="Duolingo's Year in Review pop-up on app open · Year in Monzo"
          description="The first session of the week opens with a small centered prompt: the pack, one sentence, Open or Later. Once."
          why="Highest open rate of anything here. Duolingo's Year in Review is a pop-up on open and it is their most shared moment of the year."
          risk="An interruption trains a reflex. Once per week at most, only on the first session, and only for people who did not open it from somewhere else first."
        >
          <ProductShell count={6} overlay={<MondayPrompt onOpen={go} />} />
        </Door>

        <Door
          number={9}
          title="The bell"
          from="Every notification center · Oura's report card on the Today tab"
          description="No feed element at all. The row in the notification dropdown is the door, with the hero card as its attachment."
          why="It is where people already look for things that happened to them, and the row carries the claim and the card. The floor every other door is measured against."
          risk="Lowest reach on its own. Pair it with any of the others; it is the one that should always exist."
        >
          <ProductShell count={6} headerRight={<HeaderBell onOpen={go} />} overlay={<BellDropdown onOpen={go} />} />
        </Door>

        <Door
          number={10}
          title="The floating pack"
          from="Intercom-style launchers · Duolingo's Duo widget, in spirit"
          description="A pill floating bottom right over the feed, the pack inside it. Follows the scroll, disappears on open."
          why="Visible at any scroll depth without taking a slot or a row. Reads as a thing waiting for you rather than a thing the feed is showing you."
          risk="Covers content. Small, dismissible, and gone the moment it is opened or closed."
        >
          <ProductShell count={6} overlay={<FloatingPack onOpen={go} />} />
        </Door>

        <Door
          number={11}
          title="The native card"
          from="daily.dev's own post card · Strava's activity card"
          description="A card shaped like a post, in the grid, with the cards peeking out of its image slot and a New tag. The baseline, done with care."
          why="Zero new UI vocabulary. It is in the grid where the eye already is, and the peeking cards say there is a set inside."
          risk="It is one more card among cards. Everything above it exists because this one gets scrolled past."
        >
          <ProductShell count={5} slots={[{ at: 2, node: <NativeCard onOpen={go} /> }]} />
        </Door>

        <Door
          number={12}
          title="You're all caught up"
          from="Instagram's caught-up divider after the last new post"
          description="At the end of the new posts, the divider says so, and the week is what comes next. Arrives at the natural pause."
          why="Zero competition with content, because the content is finished. The reader is at the one moment in the feed where they have time."
          risk="Only heavy readers reach the end. A second door, never the only one."
        >
          <ProductShell count={6} below={<div className="grid grid-cols-3"><CaughtUpDivider onOpen={go} /></div>} />
        </Door>

        <Section title="Side by side">
          <Table
            head={['Door', 'Feed cost', 'Carries the claim', 'Shows there are five', 'Lives how long', 'Verdict']}
            minWidth={68}
            rows={[
              ['1 · Sealed pack', 'One slot', 'No, the foil', 'Yes, on the pack', 'Monday', 'Monday door, desktop'],
              ['2 · Strip', 'One row', 'Yes', 'Yes, 5 cards', 'All week', 'Ship. The default from Tuesday'],
              ['3 · Pill', 'None', 'No', 'No', 'All week', 'With the bell, as the persistent minimum'],
              ['4 · Highlight', 'Two slots', 'Yes, large', 'Yes, cover art', 'Monday', 'Test against the pack'],
              ['5 · Snapshot', 'One row', 'Yes, plus numbers', 'Yes', 'All week', 'The rail version of the live standing'],
              ['6 · Story ring', 'None, or one row', 'No', 'No', 'All week', 'Header ring, always; tray, later'],
              ['7 · Banner', 'One row, tall', 'Yes', 'Yes, peeking', 'Until closed', 'Monday for people who dismissed the pack twice'],
              ['8 · Monday prompt', 'None', 'Yes', 'Yes', 'Once', 'First Replay ever, then never'],
              ['9 · Bell', 'None', 'Yes, plus the card', 'Yes', 'All week', 'Always on'],
              ['10 · Floating pack', 'Covers a corner', 'No', 'No', 'Until opened', 'Mobile, with the strip'],
              ['11 · Native card', 'One slot', 'Yes', 'Yes, peeking', 'Mon to Wed', 'The fallback shape'],
              ['12 · Caught up', 'None', 'Yes', 'Yes', 'All week', 'Second door, always'],
            ]}
          />
        </Section>

        <Section title="The stack I would ship">
          <div className="grid gap-4 tablet:grid-cols-4">
            <Cell label="Always" note="9 · bell, 6 · header ring">
              <p className="text-text-tertiary typo-footnote">The notification row carries the claim and the card. The ring on the avatar says there is something of yours to watch.</p>
            </Cell>
            <Cell label="Monday" note="1 · sealed pack">
              <p className="text-text-tertiary typo-footnote">The pack in slot one. Click, the pop-up opens with the tear, the deck is dealt. Highlight (4) is the A/B against it.</p>
            </Cell>
            <Cell label="Tuesday to Sunday" note="2 · strip, 12 · caught up">
              <p className="text-text-tertiary typo-footnote">The strip above the feed with the mini pack and the claim; the caught-up divider at the bottom for the people who read everything.</p>
            </Cell>
            <Cell label="First Replay ever" note="8 · Monday prompt">
              <p className="text-text-tertiary typo-footnote">Once, to teach what a Replay is. Never again for that person.</p>
            </Cell>
          </div>
          <Callout tone={CalloutTone.Good} title="The rule under all of it">
            <p>
              Every door says the claim or shows the pack, never &quot;your recap
              is ready&quot;. And every door opens the same pop-up, so whichever
              one a person finds, the experience behind it is identical.
            </p>
          </Callout>
        </Section>
        </Page>
      </>
    );
  },
};

export const Mobile: Story = {
  name: 'Doors, on the phone',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    const phone = (children: ReactNode, overlay?: ReactNode) => (
      <PhoneFrame>
        <div className="relative h-[34rem] overflow-hidden rounded-[1.75rem]">
          <PhoneShell>
            <div className="flex flex-col gap-3 p-3">{children}</div>
          </PhoneShell>
          {overlay}
        </div>
      </PhoneFrame>
    );
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
        <PageHeader eyebrow="Replay delivery · entry points" title="The same doors at phone width">
          <p>
            Pull to tear stays the Monday gesture on mobile (see 00b). These are
            the doors for the rest of the week and for people who never pull.
            Every one opens the same pop-up.
          </p>
        </PageHeader>
        <Section title="Six that fit a phone">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex flex-col gap-2">
              {phone(<><MobileStrip onOpen={go} /><Post index={0} /></>)}
              <span className="text-text-tertiary typo-footnote">2 · The strip</span>
            </div>
            <div className="flex flex-col gap-2">
              {phone(<><div className="flex gap-4 px-1"><StoryBubble onOpen={go} /></div><Post index={1} /></>)}
              <span className="text-text-tertiary typo-footnote">6 · The story bubble</span>
            </div>
            <div className="flex flex-col gap-2">
              {phone(<><Post index={2} /><Post index={3} /></>, <FloatingPack onOpen={go} mobile />)}
              <span className="text-text-tertiary typo-footnote">10 · The floating pack</span>
            </div>
            <div className="flex flex-col gap-2">
              {phone(<><Post index={4} /></>, <MondayPrompt onOpen={go} />)}
              <span className="text-text-tertiary typo-footnote">8 · The Monday prompt</span>
            </div>
            <div className="flex flex-col gap-2">
              {phone(<><div className="grid grid-cols-1"><NativeCard onOpen={go} /></div></>)}
              <span className="text-text-tertiary typo-footnote">11 · The native card</span>
            </div>
            <div className="flex flex-col gap-2">
              {phone(<><Post index={5} /><div className="grid grid-cols-1"><CaughtUpDivider onOpen={go} /></div></>)}
              <span className="text-text-tertiary typo-footnote">12 · Caught up</span>
            </div>
          </div>
        </Section>
        </Page>
      </>
    );
  },
};
