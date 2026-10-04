import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  Goal,
  Page,
  PageHeader,
  Quote,
  Section,
  SeverityPill,
  Shot,
  Table,
  chapters,
  ChapterStatus,
  Status,
} from './kit';
import { Area, chromeInventory, feedback, issues } from './audit';

const meta: Meta = {
  title: 'Mobile UX/1. Today',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const shot = (name: string): string => `/mobile-ux/${name}.jpg`;

const areas = Object.values(Area);

const chapterTitle = (id: string): string =>
  chapters.find((chapter) => chapter.id === id)?.title ?? id;

export const Today: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What does a phone user actually see today?"
        title="Sixteen real screens, one inventory of every bar, and seventeen issues with the file that causes each."
      >
        <p>
          Logged-out screens are production (app.daily.dev) in iOS Simulator
          Safari on 28 Sep 2026. Logged-in screens are a local build against
          the production API with a fake member, so the For you feed is empty
          (the fake user follows no tags); the chrome is what matters. Safari
          chrome at the bottom of each shot is not ours; in the store apps
          that strip is not there and the tab bar sits on the home indicator.
        </p>
        <ChapterNav current="1" />
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="1">
        Evidence only. Nothing here changes; it is the baseline every later chapter is measured against.
      </Status>

      <Goal
        goal="Agree on the current state from evidence, not memory, before arguing about the fix."
        metric="Every issue below has a chapter that removes it; when chapter 9 ships, this page is history."
      />

      <Section
        title="Logged out, production"
        description="What a stranger from Google sees. Note how many different top bars there are and how often Home is lit in the footer."
      >
        <div className="flex flex-wrap gap-8">
          <Shot
            src={shot('prod-explore')}
            label="Explore (/posts)"
            note="Search field, an empty band, then sort tabs. Explore lit. Floating + on the last card."
          />
          <Shot
            src={shot('prod-post')}
            label="Post"
            note="Auth strip + logo row + menu, engagement pill, tab bar with Home lit. Four layers of chrome."
          />
          <Shot
            src={shot('prod-discussed')}
            label="Discussions"
            note="Logo row + chip strip. Footer says Home, chips say Discussions."
          />
          <Shot
            src={shot('prod-tags')}
            label="Tags"
            note="Logo row + chips + tag tabs + a marketing hero + letters. Three rows of navigation before the first tag."
          />
          <Shot
            src={shot('prod-tag-js')}
            label="Tag page"
            note="Tag tabs only. No back, no logo, no title bar. Centred hero with four actions."
          />
          <Shot
            src={shot('prod-source')}
            label="Source page"
            note="Logo row as the only way up. Cover, avatar, three icon actions, stats, Join."
          />
          <Shot
            src={shot('prod-squads')}
            label="Squads directory"
            note="Own title bar with New Squad (shown logged out) + category tabs. Plus the floating +."
          />
          <Shot
            src={shot('prod-headlines')}
            label="Headlines"
            note="Gradient title + channel tabs. Swiping here is the reported bug."
          />
          <Shot
            src={shot('prod-leaderboard')}
            label="Leaderboard"
            note="Logo row + chips + page content. Reached only via a chip."
          />
          <Shot
            src={shot('prod-search')}
            label="Search results"
            note="Search field + Filters button + results. Explore lit."
          />
        </div>
      </Section>

      <Section
        title="Logged in, local build"
        description="The member shell: streak, gear, avatar in the header; Activity badge in the footer; the chip strip with lists and places."
      >
        <div className="flex flex-wrap gap-8">
          <Shot
            src={shot('local-home')}
            label="Home (For you)"
            note="Logo + streak + gear + avatar, then For you · + · Bookmarks · History · Following… The Next.js badge and the broken image on the Squads tab are dev artefacts."
          />
          <Shot
            src={shot('local-bookmarks')}
            label="Bookmarks"
            note="Same header as Home with the Bookmarks chip lit; a second search field and two more icon buttons below it."
          />
          <Shot
            src={shot('local-explore')}
            label="Explore"
            note="Same blank band as production. The + floats over the skeleton."
          />
          <Shot
            src={shot('local-squads')}
            label="Squads"
            note="Identical to logged out, plus the floating +. Two ways to create a squad on one screen."
          />
          <Shot
            src={shot('local-notifications')}
            label="Activity"
            note="In-page title + gear. The floating + is here too."
          />
          <Shot
            src={shot('local-settings-drawer')}
            label="Settings (gear)"
            note="A full-screen drawer sliding from the left: 20+ rows in five groups, Cores balance in the bar. This is the only menu on the phone."
          />
        </div>
        <Callout title="Not captured, known from the code">
          The &quot;+&quot; opens a bottom drawer with New post / Share a link
          / Poll. The streak pill opens a drawer. The comment composer on a
          post is a full-screen drawer. Profile is back + &quot;Profile&quot;
          + Follow + menu. Settings sub-pages are the same drawer with a
          back arrow that reopens the menu.
        </Callout>
      </Section>

      <Section
        title="Chrome inventory"
        description="What each page draws above and below the content on a phone. Thirteen pages, nine distinct top bars, one bottom bar plus a floating button on twelve of them."
      >
        <Table
          head={['Page', 'Top', 'Bottom', 'Back', 'Note']}
          rows={chromeInventory.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.top,
            row.bottom,
            row.back,
            row.note,
          ])}
        />
      </Section>

      <Section
        title="The feedback that came in this month"
        description="Included on request. It is a symptom of a wider pattern: horizontal gestures with no axis lock."
      >
        <Quote>&ldquo;{feedback.quote}&rdquo;</Quote>
        <div className="grid gap-3 text-text-tertiary typo-footnote tablet:grid-cols-3">
          <span>User: {feedback.user}</span>
          <span>{feedback.when}</span>
          <span>{feedback.category}</span>
        </div>
        <Callout tone={CalloutTone.Good} title="Root cause is 4 lines">
          HighlightsPage passes <code>swipeable</code> to TabContainer, which
          wires react-swipeable with <code>delta: 40</code> and no direction
          lock. A drag that the browser already treated as a scroll still
          fires <code>onSwipedLeft</code> when it ends more horizontal than
          vertical. Fix in chapter 7, and a rule that every horizontal
          surface locks its axis on the first ten pixels.
        </Callout>
      </Section>

      <Section
        title="Issues"
        description="Grouped by area. Severity is about user impact, not effort. The chapter tag is where the fix is mocked."
      >
        <div className="flex flex-col gap-8">
          {areas.map((area) => {
            const rows = issues.filter((issue) => issue.area === area);

            if (!rows.length) {
              return null;
            }

            return (
              <div key={area} className="flex flex-col gap-3">
                <h3 className="font-bold typo-title3">{area}</h3>
                {rows.map((issue) => (
                  <article
                    key={issue.id}
                    className="grid gap-3 rounded-16 border border-border-subtlest-tertiary p-4 laptop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-text-quaternary typo-caption1">
                          {issue.id}
                        </span>
                        <SeverityPill severity={issue.severity} />
                        <button
                          type="button"
                          onClick={linkTo(
                            chapters.find((c) => c.id === issue.chapter)?.story ??
                              chapters[0].story,
                          )}
                          className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2 hover:text-text-primary"
                        >
                          Chapter {issue.chapter} · {chapterTitle(issue.chapter)}
                        </button>
                      </div>
                      <span className="font-bold typo-callout">{issue.title}</span>
                      <p className="text-text-secondary typo-footnote">
                        {issue.evidence}
                      </p>
                      <span className="text-text-quaternary typo-caption1">
                        {issue.where}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-12 bg-surface-float p-3">
                      <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption2">
                        Fix
                      </span>
                      <p className="text-text-secondary typo-footnote">{issue.fix}</p>
                    </div>
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="1" />
      </Section>
    </Page>
  ),
};
