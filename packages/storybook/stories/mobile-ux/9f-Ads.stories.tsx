import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
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
import {
  ArbitragePageScroll,
  PinnedStackShell,
  PinnedStackToday,
  PublicPostAdsScroll,
  adRules,
  slotsToday,
} from './adsMocks';
import { ConsentLook, ConsentStill } from './promptsMocks';

const meta: Meta = {
  title: 'Mobile UX/9f. Ads and the arbitrage page',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const facts: [string, string][] = [
  ['Two pages carry programmatic ads', 'The public post page (/posts/[id]) for anonymous visitors, and the arbitrage page (/articles/[id]), which is the same post rebuilt for paid traffic. Nothing else on the phone has a programmatic slot: not Explore, not search, not the feed.'],
  ['Kueez through Prebid, not AdSense', 'AdSense was replaced; the only adsbygoogle lines left are comments. There is no RSOC, no search feed, no anchor unit and no vignette in the code.'],
  ['One slot map, in code', 'slots.ts numbers every unit; the phone rules are written there: the strip is the only pinned unit, only the first in-content unit shows on a phone, comment units are tablet and up, no anchor.'],
  ['The strip publishes its height', 'PhoneTopAdStrip sets a CSS variable on html that the auth banner, the back header and the post navigation read to pin under it. It collapses when unfilled and hides under 320px.'],
  ['The arbitrage page has its own rules', 'noindex, light theme forced while mounted, no sidebar, no feedback widget, no auth banner, the tab bar deliberately present so it is not a doorway page, and every navigation out of it is a full page load so no ad script follows the visitor into the app. A kill switch flag (read_ads) turns its ads off.'],
  ['Where the members are', 'Logged-in members never see a programmatic unit on either page; the shell chapters are about members. This chapter is about visitors.'],
];

export const Ads: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s question, 1 Oct: make sure nothing breaks on the arbitrage page and the public post page"
        title="Two pages carry ads on a phone: the public post page and its arbitrage twin. Under the shell every unit stays where production puts it; the pinned strip takes the top strip slot, the auth banner leaves the top, and the pinned budget while reading drops from 306px to 110px."
      >
        <p>
          Read from the code, not from captures: headless captures show the
          chrome but the auction never fills there, so the sizes below are the
          reserved sizes production books (a 58px strip, 286px cards). Every
          slot is listed with where it sits today and whether a phone shows
          it. Then the same two pages under the shell, the consent banner, and
          eight rules so the ads work never collides with the shell work.
        </p>
        <ChapterNav current="9f" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided by Tsahi, 1 Oct 2026: the strip in the top strip slot and
        the arbitrage page as the public post leaf with the cluster. The
        consent banner is decided in its own chapter, 9h: a sheet, not a
        card above the cluster.
      </Status>

      <Goal
        goal="Every unit renders in the same place and size with the shell on as with it off, and a visitor reads more of the post while the same ads are in view."
        metric="Viewable impressions per public post session unchanged or up; fill unchanged; time on the arbitrage page up."
      />

      <Section title="What the code says today" description="Six facts a developer needs before touching either page.">
        <Table
          head={['Fact', 'Detail']}
          rows={facts.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="Every unit on a phone, today"
        description="From slots.ts, the two page files and ProgrammaticAd.tsx. Slot numbers are public post / arbitrage."
      >
        <Table
          head={['Unit', 'Slot', 'Where it sits', 'On a phone']}
          rows={slotsToday.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            <span key={`${row[0]}-s`} className="font-mono text-text-secondary typo-caption1">
              {row[1]}
            </span>,
            row[2],
            <span key={`${row[0]}-p`} className={row[3].startsWith('Yes') ? 'font-bold text-text-primary' : 'text-text-tertiary'}>
              {row[3]}
            </span>,
          ])}
        />
        <div className="flex flex-wrap gap-6">
          <Shot src="/mobile-ux/prod-ads-post-top.jpg" label="Production, public post, top" note="Logged out on an iPhone 14 viewport: the back bar with Read post, Log in and Open app, the floating action bar and the footer nav. The strip is above the bar when it fills; here it did not." />
          <Shot src="/mobile-ux/prod-ads-post-comments.jpg" label="Production, public post, under the article" note="The Promoted by widget, the Google preferred-source card, the share card and You might like, stacked under the article on a phone. The rail 300×250 sits between the widget and the cards when it fills." />
          <Shot src="/mobile-ux/prod-ads-article-top.jpg" label="Production, arbitrage page, top" note="The same post at /articles: the same bar, no auth banner, the tab bar present, the Create square. Light theme is forced once the ads are live." />
        </div>
        <Callout title="The pinned budget today">
          With the strip, the auth banner and the back bar at the top and the
          floating bar and the footer nav at the bottom, about 306px of a
          664px screen is pinned. The reading area is 358px. The stack below
          draws it to scale beside the shell’s.
        </Callout>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-bold typo-callout">Today</span>
            <PinnedStackToday />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-bold typo-callout">Under the shell, while reading</span>
            <PinnedStackShell />
          </div>
        </div>
      </Section>

      <Section
        title="The two pages under the shell"
        description="Scroll them. The strip stays; the block (back, Log in, Open app) hides while reading and returns on any scroll up; the tab bar slides away and the action bar takes its slot. Every ad is content."
      >
        <PhoneRow>
          <Cell label="Public post, visitor, with the strip" verdict={Verdict.Ship} note="The strip in the top strip slot, under the status bar, on top of everything. The leaf block under it. The first in-content unit after 250 characters, the above-comments unit, then Promoted by, the rail unit and You might like under the article.">
            <PublicPostAdsScroll />
          </Cell>
          <Cell label="Public post, strip unfilled" verdict={Verdict.Ship} note="The strip collapses when the request comes back empty, as today; the block moves up to the status bar. Nothing else changes.">
            <PublicPostAdsScroll strip={false} />
          </Cell>
          <Cell label="The arbitrage page" verdict={Verdict.Ship} note="The same leaf and the same units; no auth banner, Further reading instead of the widgets, light theme forced (shown here in the Storybook theme). The cluster is present so the page is not a doorway; Read the full post opens the source in a new tab.">
            <ArbitragePageScroll />
          </Cell>
          <Cell label="The consent banner (decided in 9h)" verdict={Verdict.Ship} note="The sheet, on the first page before anything else in the regions that need it; the strip and the cluster under the dim. Chapter 9h has the four looks and the rules. Skipped inside the wrappers, as today.">
            <ConsentStill look={ConsentLook.Sheet} />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the strip keeps its pin">
            It is the one unit booked at a fixed size to be on screen for the
            whole visit; that is what it is sold as. The shell has one slot
            for a strip that is on top of everything and never hides (the
            offline strip uses it), so the ad strip takes the same slot with
            the same rule: under the status bar, above the block. Nothing new
            is invented for it, and the block’s hide already accounts for a
            strip above it.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Why the visitor reads more">
            The auth banner’s 56px leave the top: Log in and Open app are the
            leaf block’s right slot, decided in chapter 4. The back bar hides
            while reading. The bottom loses the footer nav while reading and
            keeps the compact action bar. The same ads stay in view; the
            article gets 150px more of the screen.
          </Callout>
          <Callout title="What the developers must keep">
            The CSS variable the strip publishes (the block reads it for its
            top offset instead of the auth banner and the back header); the
            unfilled collapse; the under-320px hide; the hard navigation out
            of the arbitrage page; the light theme; the read_ads kill switch;
            the ad-free squad check. None of it is redesigned.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No unit in the block, in the cluster or over the reading drawer’s
            bar. No anchor at the bottom. No unit that moves with the scroll
            progress. No second pinned row under the strip. No ad on a member’s
            page.
          </Callout>
        </div>
      </Section>

      <Section title="The rules" description="Eight lines for the ads work and the shell work to share.">
        <Table
          head={['Rule', 'Detail']}
          rows={adRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Quote>The strip on top, everything else in the flow, the cluster owns the bottom. Same ads, more article.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9f" />
      </Section>
    </Page>
  ),
};
