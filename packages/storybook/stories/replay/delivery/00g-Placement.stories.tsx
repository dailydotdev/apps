import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Callout, CalloutTone, Cell, Mono, Page, PageHeader, PhoneFrame, Section, Table } from '../shell';
import { Post } from './product';
import { Avatar, ME } from '../people';
import { ReplayPopup } from './entry';
import { Aperture, LuxStyles, Seal, SealEntry, Wordless } from './lux';
import { ClassicShell, MobileTop, RailTab, V2Shell } from './layouts';

const meta: Meta = {
  title: 'Replay delivery/00g. Where it lives',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The seal and the wordless pill placed in the two real layouts, drawn from the code: the v2 rail and page header, the classic header, sidebar and feed nav, and the mobile top. Nine placements, and the one that holds in all three.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Place = ({ letter, title, layout, idea, children, fits, fails }: { letter: string; title: string; layout: string; idea: string; children: ReactNode; fits: string; fails: string }): ReactElement => (
  <Section title={`${letter} · ${title}`} description={`${layout}. ${idea}`}>
    {children}
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="Why it fits">
        <p>{fits}</p>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="Why it might not">
        <p>{fails}</p>
      </Callout>
    </div>
  </Section>
);

/** The seal as a rail tab, at the rail's own size and with its own caption. */
const SealRailTab = ({ onOpen, compact = false, active = false }: { onOpen: () => void; compact?: boolean; active?: boolean }): ReactElement => (
  <button type="button" onClick={onOpen} className="block">
    <RailTab label="Week" compact={compact} active={active}>
      <Seal size={28} />
    </RailTab>
  </button>
);

/** The You avatar on Monday: the aurora as its ring, the seal where the streak chip sits. */
const YouWithSeal = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <button type="button" onClick={onOpen} className="relative mb-2 block">
    <span className="flex rounded-[999px] p-[2px]" style={{ background: 'conic-gradient(from 200deg, #4A7EEE, #DD5143, #29D8E5, #CE3DF3, #4A7EEE)' }}>
      <span className="flex rounded-[999px] bg-background-default p-[2px]">
        <Avatar person={ME} size={26} />
      </span>
    </span>
    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2">
      <Seal size={20} />
    </span>
  </button>
);

/** The seal as a dock pin: 24px, the week number only. */
const SealDockPin = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <button type="button" onClick={onOpen} title="Your week 37" className="block">
    <Seal size={24} />
  </button>
);

/** The wordless pill at header-button height (36px), for the classic header cluster. */
const WordlessHeader = ({ onOpen }: { onOpen: () => void }): ReactElement => (
  <div className="flex h-9 items-center">
    <Wordless onOpen={onOpen} />
  </div>
);

/** The seal alone at 30px for a header button slot or a mobile action slot. */
const SealButton = ({ onOpen, size = 30 }: { onOpen: () => void; size?: number }): ReactElement => (
  <button type="button" onClick={onOpen} className="flex h-9 w-9 items-center justify-center rounded-10 hover:bg-surface-float" title="Your week 37 · 5 highlights">
    <Seal size={size} />
  </button>
);

export const Placement: Story = {
  name: 'Nine placements, two layouts',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <LuxStyles />
          <PageHeader eyebrow="Replay delivery · placement" title="Where a personal object belongs">
            <p>
              The seal and the wordless pill are objects about the person, so
              they should live where the product already keeps things about
              the person: the streak, the bell, the You tab. Both real layouts
              are drawn here from the code, not from memory. In v2 the sidebar
              owns the header: a 64px rail with Home and Search fixed, the
              reorderable tabs, the shortcuts dock, and Invite, Support and
              Settings at the foot; the page has a 56px header strip and then
              the grid. Classic keeps the top header with the search panel and
              the header buttons, a sidebar of sections, and the feed nav
              tabs. Nine placements, then the one that holds in both, and on
              the phone.
            </p>
          </PageHeader>

          <Section title="The two layouts, untouched" description="So the additions below are judged against the real neighbours.">
            <V2Shell count={3} />
            <ClassicShell count={3} />
          </Section>

          <Place
            letter="A"
            title="A rail tab after Streak"
            layout="v2"
            idea="The seal becomes a rail tab of its own, with the caption Week, sitting between Streak and You. Reorderable like the others, and it opens the pop-up instead of a panel."
            fits="It is where the person already looks for things about themselves: Streak is one tab up, You is one tab down. The seal is the same size as the streak tile, and the caption reads at the rail's own type size."
            fails="A tab that opens a pop-up rather than a panel breaks the rail's rule. And it adds a seventh tab to a rail that was designed to stay short."
          >
            <V2Shell count={3} slots={{ tabAfter: { after: 'Streak', node: <SealRailTab onOpen={go} /> } }} />
            <V2Shell count={3} compact slots={{ tabAfter: { after: 'Streak', node: <SealRailTab onOpen={go} compact /> } }} />
          </Place>

          <Place
            letter="B"
            title="Inside the You tab"
            layout="v2"
            idea="No new tab. On Monday the You avatar's streak chip becomes the seal for the week; the You panel gets a 'Your week' row at the top. After it is opened, the chip goes back to the streak."
            fits="Zero additions to the rail. The avatar is already the account context, and the chip under it is already the place where a number about the person lives."
            fails="It hides behind the You panel for everyone who does not notice the chip changed, and it takes the streak chip's spot on the day the streak matters most."
          >
            <V2Shell count={3} slots={{ youOverride: <YouWithSeal onOpen={go} /> }} />
          </Place>

          <Place
            letter="C"
            title="The page header, right side"
            layout="v2"
            idea="The wordless pill sits in the feed page's header strip, right-aligned, before the filter and layout buttons. The heading says For you; the pill says W37."
            fits="The strip is 56px and mostly empty on the right. It is at the top of the feed on every page that has a feed, and it is where the feed's own actions already live. Nothing moves."
            fails="It is a feed-level slot for a person-level object. On the Explore hub or a squad page it would have to disappear or feel out of place."
          >
            <V2Shell count={3} headerRight={<Wordless onOpen={go} />} />
          </Place>

          <Place
            letter="D"
            title="A pin in the dock"
            layout="v2"
            idea="The seal as a pinned shortcut in the dock, 24px, the week number only, next to the letters for Tags, Sources and Bookmarks. Pinned by default for the week; the person can drag it out."
            fits="The dock is the person's own row, built for small square chips, and a chip the person can remove is the politest possible placement."
            fails="Twenty-four pixels is small for the door to the whole week, and a default pin in a user-owned dock is exactly the kind of thing that gets dragged out on sight."
          >
            <V2Shell count={3} slots={{ dockExtra: <SealDockPin onOpen={go} /> }} />
          </Place>

          <Place
            letter="E"
            title="Above the foot"
            layout="v2"
            idea="The seal alone, just above Invite, Support and Settings, where the rail has slack. No caption."
            fits="It costs nothing and it is always in the same place. The foot is where the rail keeps its quiet, permanent things."
            fails="The foot is the least looked-at part of the rail. A Monday object should not live next to the settings gear."
          >
            <V2Shell count={3} slots={{ aboveFoot: <div className="mb-2"><SealButton onOpen={go} size={28} /></div> }} />
          </Place>

          <Place
            letter="F"
            title="In the header cluster, next to the streak"
            layout="Classic"
            idea="The wordless pill between the reading streak button and the bell. The streak counts days; the pill holds the week."
            fits="The header cluster is where the classic layout keeps the person: quest, streak, bell, avatar. The pill's height matches the buttons and its black lacquer reads as a sibling of the streak, not as a promotion."
            fails="The cluster is already four items wide; on a laptop the search panel starts to lose room. And the pill's black is the strongest thing in a light header."
          >
            <ClassicShell count={3} headerExtra={<WordlessHeader onOpen={go} />} />
            <ClassicShell count={3} headerExtra={<SealButton onOpen={go} />} />
          </Place>

          <Place
            letter="G"
            title="The feed nav's right actions"
            layout="Classic"
            idea="The seal in the FeedNav actions on the right, before the filter and layout buttons, at the same height as the tabs."
            fits="Same logic as C: it is the top of the feed, next to the feed's own controls, and it does not touch the header or the sidebar."
            fails="Same weakness as C: it belongs to the feed page, so it vanishes on any page without a feed nav."
          >
            <ClassicShell count={3} navRight={<SealButton onOpen={go} />} />
          </Place>

          <Place
            letter="H"
            title="A sidebar item under For you"
            layout="Classic"
            idea="'Your week' as an item in the main section of the sidebar, with the seal as its icon, under Discussions."
            fits="The sidebar's main section is the product's table of contents, and a weekly page about the person is a reasonable entry in it. It is also the placement that gives the binder a home later."
            fails="It reads as a page, not a moment. Nothing about a sidebar row says Monday, and the seal at 16px loses its colour."
          >
            <ClassicShell count={3} sidebarExtra={<button type="button" onClick={go} className="flex items-center gap-3 rounded-10 px-3 py-1.5 text-text-tertiary typo-callout hover:bg-surface-float"><Seal size={18} />Your week</button>} />
          </Place>

          <Place
            letter="I"
            title="The mobile top"
            layout="Mobile"
            idea="Two spots: the seal as the first chip in the feed row, before For you, or in the action slot at the right next to the filter. Both are inside the existing chip row; nothing new is added to the screen."
            fits="The chip row is the one strip every mobile session scrolls past, and a dark seal at the head of a row of grey chips is the first thing the eye lands on."
            fails="The first-chip slot is also where a custom feed's chip could go; on a phone that has one, the seal pushes For you off the first screen."
          >
            <div className="flex flex-wrap items-start gap-6">
              {[
                ['First chip', <MobileTop key="a" first={<button type="button" onClick={go} className="mr-1 shrink-0"><Seal size={30} /></button>} />],
                ['Action slot', <MobileTop key="b" actions={<SealButton onOpen={go} size={26} />} />],
              ].map(([label, node]) => (
                <div key={String(label)} className="flex flex-col gap-2">
                  <PhoneFrame>
                    <div className="h-[28rem] overflow-hidden rounded-[1.75rem] bg-background-default">
                      {node}
                      <div className="flex flex-col gap-3 p-3">
                        <Post index={0} />
                      </div>
                    </div>
                  </PhoneFrame>
                  <span className="text-text-tertiary typo-footnote">{String(label)}</span>
                </div>
              ))}
            </div>
          </Place>

          <Section title="Side by side">
            <Table
              head={['Placement', 'Layout', 'Touches', 'Always present', 'Reads as "about me"', 'Verdict']}
              minWidth={68}
              rows={[
                ['A · Rail tab after Streak', 'v2', 'The rail', 'Yes', 'Yes, between Streak and You', 'Ship. The seal as a tab.'],
                ['B · Inside the You tab', 'v2', 'The avatar chip', 'Monday only', 'Yes', 'Pair with A: the chip is the Monday signal, the tab is the door.'],
                ['C · Page header, right', 'v2', 'The feed header strip', 'Feed pages only', 'No, it is a feed control', 'The Monday plaque slot if a second door is wanted.'],
                ['D · Dock pin', 'v2', 'The dock', 'Until dragged out', 'Yes', 'No. Too small, too removable.'],
                ['E · Above the foot', 'v2', 'The rail foot', 'Yes', 'No', 'No. Wrong neighbourhood.'],
                ['F · Header cluster, next to streak', 'Classic', 'The header buttons', 'Yes', 'Yes', 'Ship. The seal alone; the pill on Monday.'],
                ['G · Feed nav actions', 'Classic', 'The feed nav', 'Feed pages only', 'No', 'No. Same weakness as C.'],
                ['H · Sidebar item', 'Classic', 'The sidebar', 'Yes', 'As a page', 'Later, for the binder.'],
                ['I · Mobile chip row', 'Mobile', 'The chip row', 'Yes', 'Somewhat', 'Ship the action slot; the first chip on Monday only.'],
              ]}
            />
          </Section>

          <Section title="The placement that holds">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="v2" note="A · a rail tab, with B as the Monday signal">
                <p className="text-text-tertiary typo-footnote">The seal is a rail tab captioned Week, between Streak and You. On Monday the avatar's chip wears the aurora until the week is opened. The rail already groups the person&apos;s things; this joins them.</p>
              </Cell>
              <Cell label="Classic" note="F · next to the reading streak">
                <p className="text-text-tertiary typo-footnote">The seal in the header cluster between the streak and the bell, at button height. On Monday it is the wordless pill; from Tuesday the seal alone. Same neighbours as in v2: streak, notifications, profile.</p>
              </Cell>
              <Cell label="Mobile" note="I · the action slot">
                <p className="text-text-tertiary typo-footnote">The seal in the chip row&apos;s action slot next to the filter, every day; the first chip on Monday. Pull-to-tear remains the Monday gesture.</p>
              </Cell>
            </div>
            <Callout tone={CalloutTone.Good} title="The one rule">
              <p>
                In every layout the seal sits next to the streak. The streak
                is the product&apos;s existing daily object about the person;
                the seal is its weekly sibling. Wherever the streak lives, the
                seal lives beside it, so the placement never has to be
                re-decided when the layout changes again.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Neutral} title="Why not the page header or the feed nav">
              <p>
                C and G looked right in the earlier mocks because those mocks
                had a header the real v2 does not have. In the real product
                the page header strip is a feed control, and the seal is not a
                feed control. It belongs with <Mono>StreakBadge</Mono> in the
                rail and with <Mono>ReadingStreakButton</Mono> in the classic
                header.
              </p>
            </Callout>
          </Section>
          <div className="hidden">
            <Aperture />
            <SealEntry onOpen={go} />
          </div>
        </Page>
      </>
    );
  },
};
