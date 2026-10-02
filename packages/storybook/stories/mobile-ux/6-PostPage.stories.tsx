import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  Compare,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Table,
  Verdict,
  ChapterStatus,
  Status,
} from './kit';
import { TodayPost } from './screens';
import { PostStill } from './chrome';
import { PostPlayground } from './postPlayground';

const meta: Meta = {
  title: 'Mobile UX/6. Post page',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const heights = [
  ['Status bar', '54', '54'],
  ['Top', '48 full-width bar (back, Read post, menu)', 'floating buttons: back, share, menu; content runs under them'],
  ['Bottom: engagement', '48 pill + 12 gap, floating above the tab bar', '52 bar above the cluster at rest; in the bottom slot at 44 while reading'],
  ['Bottom: tab bar', '64 + safe area, always', '56 bar + Create at rest; slides below the screen while reading, back on scroll-up'],
  ['Reserved spacer', '160 (h-40)', 'one rest stack (52 + 8 + 56) at the bottom of the page, 44 + 8 while reading'],
  ['Chrome while reading on a 667pt phone', '≈ 45% of the screen', '≈ 15% (one row top, one row bottom)'],
];

export const PostPage: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What should the screen look like while someone reads?"
        title="Both bars show at rest. As you read, the tab bar slides down out of the screen with your scroll and the action bar takes its place, shrinking like the Home bar; scroll up and it all comes back, continuously."
      >
        <p>
          The post page is where the app earns its keep, and it is the most
          crowded screen we have: a back bar, a floating engagement pill, the
          tab bar beneath it, 160px reserved for both, and a full-screen
          drawer for writing a comment. Round one proposed hiding the tab bar
          on posts; Tsahi wants both bars kept, so this chapter does what
          the Home bar does: both bars at rest, then the tab bar leaves with
          the scroll and the action bar becomes the one bar, shrinking and
          pulling in on the same progress. Round four replaced the earlier
          two-state fold (which read as a jump) with this continuous version.
        </p>
        <ChapterNav current="6" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="4">
        Both bars stay and fold inline; today's icon set; comment opens the full-page composer (round 5, matching the rest of the app). Use the playground to see every state.
      </Status>

      <Goal
        goal="Keep the tab bar and the action bar, spend one row of chrome while reading with no snap between states, and keep commenting one tap away."
        metric="Chrome share of a 667pt screen while reading (≈45% to ≈15%), comments per post view, and back-to-feed continuation."
      />

      <Section
        title="Playground: tap everything"
        description="A working post page. Scroll it to watch the fold, tap the comment, share, bookmark and upvote icons, open the menu. The panel on the right says what just happened and lets you jump to any state."
      >
        <PostPlayground />
      </Section>

      <Section
        title="Today versus proposed"
        description="Same post, same phone. Today at rest; proposed at rest (both bars) and while reading (tab bar gone below, action bar compact in its slot)."
      >
        <Compare before={<TodayPost />} after={<PostStill p={0} />} />
        <Compare
          beforeLabel="Proposed · at rest (p = 0)"
          afterLabel="Proposed · reading (p = 1)"
          before={<PostStill p={0} />}
          after={<PostStill p={1} />}
        />
        <Table
          head={['Layer', 'Today', 'Proposed']}
          rows={heights.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section
        title="How the two bars combine"
        description="One scroll progress drives both: the tab row translates down and fades, the action bar translates into the freed slot and shrinks. At p = 0.5 you see both mid-way; there is no state change to notice."
      >
        <PhoneRow>
          <Cell label="At rest" verdict={Verdict.Ship} note="Engagement bar above the tab cluster, each on its own glass. This is what you see when the page opens and whenever you scroll up.">
            <PostStill p={0} />
          </Cell>
          <Cell label="Half way" note="p = 0.5: the tab bar is on its way out, the action bar is on its way down and already shrinking. This is what the earlier version jumped over.">
            <PostStill p={0.5} />
          </Cell>
          <Cell label="Reading" verdict={Verdict.Ship} note="The tab bar is below the screen; the action bar sits in its slot at 44px, pulled in, icons only. Scroll up and the tab bar returns.">
            <PostStill p={1} />
          </Cell>
        </PhoneRow>
        <Callout tone={CalloutTone.Bad} title="Withdrawn: the two-state fold">
          Round three folded the tab bar into a Home button at p = 0.5 and
          put the action bar beside it. It read as a jump. Now nothing
          changes state: the tab bar is always the same bar, it is just
          further down the screen, and one scroll up brings it back.
        </Callout>
      </Section>

      <Section title="What moved where">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Top: three buttons, no bar, nothing twice">
            Back, Share, Menu as floating buttons; the content runs under
            them. The source row (avatar, name, date, read time) appears once,
            in the content, exactly as X does with &quot;Post&quot;: the
            first draft put the source in the bar as well and it read as a
            duplicate. The post menu exists once, in the top-right button.
            &quot;Read post&quot; leaves the header for a full-width button
            after the summary, where every reader passes.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Bottom: the engagement bar">
            Today&apos;s icon set, unchanged: upvote with count, downvote,
            comment with count, bookmark, share. Tapping comment opens the
            full-page composer from chapter 3d; tapping the count scrolls to
            the thread. Long-press on
            downvote opens Not interested, long-press on bookmark opens Move
            to folder. Copy link lives inside Share.
          </Callout>
          <Callout title="Comments">
            Reply and Add a comment open the full-page composer decided in
            round 5 (the post as a compact card, the field, the toolbar and
            Post), the same one everywhere in the app.
          </Callout>
          <Callout title="Reading the article">
            Read opens the page in front with the post as a drawer at the
            bottom, in a WKWebView drawn by the wrapper; chapter 6b has the
            flow and the rules. On the web it stays a new tab.
          </Callout>
        </div>
        <p className="text-text-tertiary typo-footnote">
          The solid material as a design choice, the round 4 comment sheet and
          the Safari view for the link are in the{' '}
          <button
            type="button"
            onClick={linkTo('Mobile UX/Archive/Scroll arms, post page and reading')}
            className="font-bold text-text-primary underline"
          >
            Archive: Scroll arms, post page and reading
          </button>
          .
        </p>
      </Section>

      <Section title="Edge cases">
        <DigIn title="Logged out">
          <p>
            This chapter mocks a member. Logged out, the top bar is decided
            in dailydotdev/apps#6731 (back, Read post, Log in, Open app) and
            the bottom is the Charm footer from the footer PR. Both replace
            what is here, they do not stack on it.
          </p>
        </DigIn>
        <DigIn title="Brief posts and the post redesign flag">
          <p>
            Brief posts already hide the engagement pill. The post_redesign
            arm (PostFocusCard) gets the same top buttons and bottom bar; the
            experiment is about the content card, not the shell.
          </p>
        </DigIn>
        <DigIn title="Ads">
          <p>
            PhoneTopAdStrip sits above the top bar today and pushes every
            sticky offset with a CSS variable. Under the floating buttons it should be
            in-content below the fold-safe area, not another fixed row; the
            budget in chapter 4 has no slot for it.
          </p>
        </DigIn>
        <Callout tone={CalloutTone.Bad} title="Do not">
          Do not stack three layers (bar, pill, tab bar), do not keep a
          spacer larger than the rest row, do not repeat the source or the
          menu in the top chrome, and do not add a second composer: comments
          use the full-page composer everywhere.
        </Callout>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="6" />
      </Section>
    </Page>
  ),
};
