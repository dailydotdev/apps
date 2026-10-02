import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  ArchiveNav,
  Callout,
  Cell,
  ChapterStatus,
  DigIn,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Status,
  Table,
  Verdict,
} from '../kit';
import {
  activityTypes,
  Chips,
  HappeningNowDemo,
  ProfileTabsDemo,
  RowSpecimen,
  SegmentLook,
  segmentLookNotes,
  Segments,
  SquadTabsDemo,
} from '../tabMocks';
import {
  ChannelRail,
  DrillIn,
  GroupedList,
  HomeCard,
  OwnPage,
  QuietSecondRow,
  StackedDraft,
  TrailingPicker,
  TrailingPickerOpen,
} from '../secondRow';
import { RowStyleSwitch } from '../rowStyle';

const meta: Meta = {
  title: 'Mobile UX/Archive/Tab rows and segments',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const otherLooks = Object.values(SegmentLook).filter((look) => look !== SegmentLook.Quiet);

const lookLabel: Partial<Record<SegmentLook, string>> = {
  [SegmentLook.Pills]: 'Pills (too dominant)',
  [SegmentLook.Underline]: 'Underline (first draft)',
};

const archived = [
  ['Segment looks: Pills, Underline, Track, Pill, Weight, Scale, Dot', '4c', 'Round 5: the three levels are the product’s own chip; the underline, the track and the filled pills (too dominant) stay for the record', 'Quiet is the pick: the feed strip’s chip at 28px, plain text with a tonal fill and a hairline on the active one.'],
  ['Happening now: the draft (0) and alternatives A to G', '4c', 'Round 5: Happening now channels, no second row; the active segment carries a chevron that opens the channel sheet', 'H is decided. The draft read as two bars; A to G each add chrome, cost feed or change the decided Home row.'],
  ['The A/B mapping switch: plain segments and outlined chips, or the reverse', '4c', 'Round 5, later: segments plain with a tonal active, filter chips outlined with a primary-button active; and no A/B tests anywhere', 'Mapping A is decided. The live switch was built for comparison and is parked here so the shared row components keep one default.'],
  ['Pinned segments under the floating buttons (squad, profile)', '4c', 'Round 5, revised: the whole top block hides as one solid piece; nothing at the top is permanently sticky', 'The pre-block model: the band turned solid and the segments pinned under it. SquadScroll and ProfileScroll replace it.'],
  ['Home, Happening now with pinned segments (HappeningNowDemo)', '4c', 'Round 5, revised: the whole top block hides as one solid piece', 'Segments pinned under the status bar. HomeScroll replaces it in the live chapter.'],
];

export const TabRows: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive · chapter 4c"
        title="Tab rows and segments: the looks, the second-row alternatives and the pinned demos that were rejected, superseded or parked."
      >
        <p>
          Nothing on this page is built from. Each item names the decision row
          that retired it, quoted from the decisions log. The live chapter
          (4c. Tabs everywhere) keeps the Quiet look, option H and the scroll
          demos built on the hiding block.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="5">
        Reference only. Collected in round 5 from chapter 4c; nothing here changes a decision.
      </Status>

      <ArchiveNav />

      <Section
        title="What is here and why"
        description="One row per archived item. Retired by quotes the decision row in a few words."
      >
        <Table
          head={['Item', 'Chapter it came from', 'Retired by', 'Why']}
          rows={archived.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
          ])}
        />
      </Section>

      <Section
        title="Segments: the seven other looks"
        description="Tsahi rejected the underline, the track and then the filled pills (too big, too dominant, busy). The pick, Quiet, is in chapter 4c. Each look on the Home row and on the Bookmarks lists."
      >
        <div className="flex flex-col gap-8">
          {otherLooks.map((look) => (
            <div key={look} className="flex flex-wrap items-start gap-6">
              <RowSpecimen
                label={lookLabel[look] ?? look.charAt(0).toUpperCase() + look.slice(1)}
                note={segmentLookNotes[look]}
              >
                <Segments
                  items={['For you', 'Happening now', 'Following']}
                  active={1}
                  look={look}
                  trailing={
                    <span className="ml-auto flex size-8 shrink-0 items-center justify-center text-text-tertiary">
                      <PlusIcon size={IconSize.Small} />
                    </span>
                  }
                />
              </RowSpecimen>
              <div className="w-[23.4375rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
                <Segments items={['Quick saves', 'Read it later', 'Frontend picks']} active={0} look={look} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Happening now: the draft and A to G"
        description="Tsahi flagged the draft: the channel chips under the Home segments felt too connected and looked too similar. Each alternative is a whole phone. H (the segment is the picker) is decided and stays in chapter 4c."
      >
        <PhoneRow>
          <Cell label="0 · The draft" verdict={Verdict.Skip} note="Segments, then chips. Same weight, same inset, same 44px rhythm: it reads as two bars, and Material and NN/g both warn against it.">
            <StackedDraft />
          </Cell>
          <Cell label="A · Trailing picker" verdict={Verdict.Skip} note="Same sheet as H, opened from a small control on the list header line instead of the segment (App Store's All Categories). Quieter, but the segment row gives no hint that channels exist.">
            <TrailingPicker />
          </Cell>
          <Cell label="A · Open" verdict={Verdict.Skip} note="The sheet is the same as H.">
            <TrailingPickerOpen />
          </Cell>
          <Cell label="B · Channel rail" verdict={Verdict.Skip} note="Channels as cards in the content (Apple News, YouTube Subscriptions). A different shape, so no confusion, and each card is a channel page. Costs 64px of feed and turns a filter into navigation.">
            <ChannelRail />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell label="C · Grouped list" verdict={Verdict.Skip} note="One stream grouped by channel with See all links (Apple News Today). No control at all, but no way to stay in Security, and deep channels are far down.">
            <GroupedList />
          </Cell>
          <Cell label="D · Two rows, made different" verdict={Verdict.Skip} note="Keep the chips but drop them a level: caption size, no border, a tinted band, 28px tall. Was the fallback; set aside with the rest because there is no fallback experiment.">
            <QuietSecondRow />
          </Cell>
          <Cell label="E · Drill in" verdict={Verdict.Skip} note="Tap Channels and the segment row becomes the channel chips with an X to return (Spotify). One row at a time, but the state is invisible once you scroll and it hides the other segments.">
            <DrillIn />
          </Cell>
          <Cell label="F · Its own page" verdict={Verdict.Skip} note="Happening now leaves Home and becomes a leaf where the channels are the segments. Cleanest hierarchy; one more tap from Home and it changes the decided Home row.">
            <OwnPage />
          </Cell>
          <Cell label="G · Home card" verdict={Verdict.Skip} note="Not a segment: a compact module at the top of For you linking to F. Good for glance, bad for the daily reader who wants the whole stream.">
            <HomeCard />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The A/B mapping switch, parked"
        description="Both quiet treatments are the product's 28px chip; the switch flips which one is the segment and which is the filter chip. Mapping A is decided (plain segments, outlined chips) and every live phone uses it. Kept here because the shared components still read the mapping from context."
      >
        <RowStyleSwitch>
          {() => (
            <div className="flex flex-wrap gap-8">
              <RowSpecimen
                label="Segments"
                note="The views of this page. Under mapping A: plain tertiary text, the active one on a soft tonal fill with a hairline."
              >
                <Segments items={['For you', 'Happening now', 'Following']} active={1} />
              </RowSpecimen>
              <RowSpecimen
                label="Filter chips"
                note="Narrow this list. Under mapping A: hairline-outlined, the active one a primary button."
              >
                <Chips items={activityTypes} active={0} />
              </RowSpecimen>
            </div>
          )}
        </RowStyleSwitch>
      </Section>

      <Section
        title="Pinned rows under the buttons: the pre-block model"
        description="Scroll each. Before the hiding block, a leaf's segments docked under the floating buttons and the band turned solid with them, and on Home the segments pinned under the status bar. Round 5 revised this: the whole top block hides while reading and returns on a nudge up. Chapter 4c now shows SquadScroll, ProfileScroll and HomeScroll instead."
      >
        <PhoneRow>
          <Cell label="Squad page, pinned" verdict={Verdict.Skip} note="Cover, hero, then Posts · About pinning under the band as it turns solid; the name fades into the row.">
            <SquadTabsDemo />
          </Cell>
          <Cell label="Profile, pinned" verdict={Verdict.Skip} note="Posts · Replies · Upvoted pin the same way.">
            <ProfileTabsDemo />
          </Cell>
          <Cell label="Home, Happening now, pinned" verdict={Verdict.Skip} note="The brand row slides away and the segments pin under the status bar; the channel shows on the list header line.">
            <HappeningNowDemo channel="Security" />
          </Cell>
        </PhoneRow>
        <Callout title="Where the decided versions live">
          Chapter 4c has the Quiet look at 1:1, option H with its sheet, and
          the scroll demos on the hiding block. Chapter 4e has the block on
          every page.
        </Callout>
        <DigIn title="Why these stay in Storybook at all">
          <p>
            The decisions log cites them. A reviewer who reads &quot;the
            underline was rejected&quot; or &quot;D was the fallback&quot; can
            open this page and see what was rejected, without the live chapter
            carrying a Reference only pill next to every decided cell.
          </p>
        </DigIn>
      </Section>
    </Page>
  ),
};
