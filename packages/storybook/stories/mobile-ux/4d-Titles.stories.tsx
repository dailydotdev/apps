import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Shot,
  Status,
  Table,
  Verdict,
} from './kit';
import { titleRows, titleRules } from './titleData';
import { BookmarksBar, LongTitleStill, titledPages } from './titles';
import { ActivityScroll, BookmarksScroll, SquadScroll } from './scrollPages';
import { edgeEffectFacts, titleScrollBenchmarks, titleScrollSources } from './titleScrollResearch';

const meta: Meta = {
  title: 'Mobile UX/4d. Page titles',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const shots = [
  { src: '/mobile-ux/prod-tabs-tags.jpg', label: 'Tags: 32px, centred', note: '"Explore tags" as a marketing headline over two lines of copy.' },
  { src: '/mobile-ux/prod-tabs-tag-react.jpg', label: 'Tag: 32px, centred', note: 'The tag name at the same size, centred, with three actions under the copy.' },
  { src: '/mobile-ux/prod-tabs-highlights.jpg', label: 'Happening now: 32px gradient', note: 'A gradient title with a copy-link icon, above tabs that repeat the name.' },
  { src: '/mobile-ux/prod-tabs-squad-page.jpg', label: 'Squad: 24px, left', note: 'Name under the cover, left, then description, badges, stats and Join.' },
  { src: '/mobile-ux/prod-tabs-profile.jpg', label: 'Profile: 24px, left, plus a bar', note: 'The name in content and "Profile" in the back bar above it.' },
  { src: '/mobile-ux/prod-tabs-squads-discover.jpg', label: 'Squads: 17px in a row', note: 'The page name shares a row with Log in and Open app.' },
];

export const Titles: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="How a page says its name"
        title="Five sizes, three positions and six pages with no name at all today. Proposed: pages carry their name in the top row beside the back button; things keep it in the hero and the row picks it up on scroll; roots carry it in the brand row."
      >
        <p>
          Tsahi&apos;s notes: the 32px headings drafted for Activity,
          Bookmarks and the tag page felt too big, and the name belongs
          close to the back button or in the top header area. This chapter
          inventories every page name on the phone, compares the placements
          on one page, and sets the rule the other chapters now follow.
        </p>
        <ChapterNav current="4d" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        One size (20px) for the page name wherever it appears: beside the back
        button on pages, in the brand row on roots, and as the hero name on things,
        which the block picks up once the hero has passed. On scroll the whole block, name
        and buttons included, hides while reading and returns on a nudge up (chapter 4e).
      </Status>

      <Callout title="Archived from this chapter">
        The in-content titles at 24 and 32, the cover and root demos with
        pinned rows, and the three set-aside scroll arms (soft edge, floating
        buttons, solid band) now live in Mobile UX / Archive / Headers, titles
        and covers. This chapter keeps the 20px name beside the back button
        and D, the block that hides.
      </Callout>

      <Goal
        goal="A member always knows which page they are on from the first line of content, and every page looks like it belongs to the same app."
        metric="Zero pages with the name in two places; one heading class in the phone shell; no page heading above 24px."
      />

      <Section
        title="Today"
        description="Production, logged out, plus the code inventory. The same job done at 32, 24, 20, 17 and 13px, centred and left, in content and in a bar, and six pages (Explore, Search, Sources, Bookmarks, History, Following) that never say their name on a phone."
      >
        <div className="map-scroll-none flex gap-6 overflow-x-auto pb-2">
          {shots.map((shot) => (
            <Shot key={shot.src} src={shot.src} label={shot.label} note={shot.note} width={240} />
          ))}
        </div>
        <Table
          head={['Page', 'Today', 'Size', 'Where', 'Proposed']}
          rows={titleRows.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.today,
            <span key={row.size} className="whitespace-nowrap tabular-nums">{row.size}</span>,
            row.place,
            row.proposed,
          ])}
        />
      </Section>

      <Section
        title="Where the name goes"
        description="The same page four ways. The top row wins: it is where the back button already is, it costs no content height, and it is what X, Threads and iOS do."
      >
        <PhoneRow>
          <Cell label="A · Top row, beside back" verdict={Verdict.Ship} note="Bookmarks as plain bold text (20px) after the back button, no box, actions on the right. Fixed with the buttons; on scroll the content fades under it (next section). The lists sit right under it.">
            <BookmarksBar />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Try it: things and roots"
        description="Scroll both. On a squad the name lives in the hero; the row shows it once the hero is gone, so it is never on screen twice. On a root the brand row carries the name and slides away like Home's."
      >
        <PhoneRow>
          <Cell label="Squad page" verdict={Verdict.Ship} note="Cover edge to edge, Watercooler at 24 in the hero with its mark; scroll and the same name fades into the top row as the band turns solid and the segments pin under it.">
            <SquadScroll />
          </Cell>
          <Cell label="Activity root" verdict={Verdict.Ship} note="Activity where Home has the logo, bell, streak and avatar on the right; the row slides away and the type chips pin.">
            <ActivityScroll />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the row, and why no box">
            The back button already marks the top-left of every leaf, so
            the name next to it is where the eye goes first, and it costs
            the content nothing. It is plain text, not a floating capsule:
            the round-four call against a title box stands, and the solid
            band behind the buttons gives the text its backing once content
            scrolls under it.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Why things keep a hero name">
            A squad or a person is introduced by a mark, a name and a meta
            line; that hero is the page. Putting the same name in the row
            at rest would show it twice. X and Threads do the same on
            profiles: buttons over the cover, the name in the bar only after
            you scroll.
          </Callout>
        </div>
      </Section>

      <Section
        title="On scroll: what stays"
        description="Bookmarks scrolled four ways: the pick and the three treatments that were on the table. Scroll each."
      >
        <PhoneRow>
          <Cell label="D · The block hides, solid" verdict={Verdict.Ship} note="Tsahi's pick after review: back, name, actions and the segments are one solid block on the page background; reading down hides it entirely, a short scroll up brings it back. Chapter 4e applies it to every page.">
            <BookmarksScroll />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="The call: D, the block hides">
            Apple&apos;s iOS 26 answer (a transparent bar over a soft scroll
            edge) was verified and mocked, and Tsahi set it aside: the
            gradient did not read right, and the behaviour he wants is
            X&apos;s, where the whole header leaves while you read and comes
            back on a nudge. With the block gone while reading, the solid
            page background is the honest backing when it is there. The
            title stays with the block, at the same 20px on every page.
          </Callout>
          <Callout title="What the research still tells us">
            Apple never hides a navigation bar; X, Instagram, YouTube and
            Threads hide the home header and keep the bottom bar; X and
            Instagram keep profile bars and tabs pinned. Our rule goes one
            step further than all of them by hiding the block on things too,
            for one rule everywhere; the benchmark table in chapter 4e is the
            record if that step needs revisiting.
          </Callout>
        </div>
        <Table
          head={['Platform or app', 'What stays at the top', 'Title', 'What is behind it']}
          rows={titleScrollBenchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
          ])}
        />
        <DigIn title="The scroll edge effect, precisely">
          <Table
            head={['Fact', 'Detail']}
            rows={edgeEffectFacts.map((row) => [
              <span key={row[0]} className="font-bold text-text-primary">
                {row[0]}
              </span>,
              row[1],
            ])}
          />
          <ul className="mt-3 flex flex-col gap-1">
            {titleScrollSources.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-text-secondary underline typo-footnote">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </DigIn>
      </Section>

      <Section
        title="The rule"
        description="Eight lines. Applied to every page in this Storybook from this round on."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={titleRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Every page under the rule"
        description="Roots, pages and things at rest. Same row, same inset, same meta style."
      >
        <div className="flex flex-wrap gap-6">
          {titledPages.map((page) => (
            <div key={page.name} className="flex w-60 flex-col gap-3">
              {page.render()}
              <div className="flex flex-col gap-1">
                <span className="font-bold typo-callout">{page.name}</span>
                <span className="text-text-tertiary typo-footnote">{page.note}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Long names"
        description="One line in the row with an ellipsis; two lines in the hero. Shown together here only to compare the two cuts."
      >
        <PhoneRow>
          <Cell label="A long squad name" verdict={Verdict.Ship} note="In the product the row name appears only after the hero scrolls out; this still shows both cuts at once.">
            <LongTitleStill />
          </Cell>
        </PhoneRow>
        <Quote>Back, then the name, then the actions: one row tells you where you are.</Quote>
        <DigIn title="Implementation notes">
          <p>
            The leaf top row (chapter 3b) gets a title slot: plain text
            between the back button and the actions, fixed with them, with a
            band behind that turns solid once content scrolls under
            (an IntersectionObserver on a sentinel, or a scroll-driven
            animation where supported). Pages pass the title always; things
            pass it with an opacity driven by the hero name leaving the
            viewport. Roots render a brand row with the name in the logo
            slot. This replaces the tag and tags heroes, the Happening now
            gradient title, AccountPageHeading, the manage and members bars
            and the ‹ Profile bar on phones. Desktop keeps its own headings.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="4d" />
      </Section>
    </Page>
  ),
};
