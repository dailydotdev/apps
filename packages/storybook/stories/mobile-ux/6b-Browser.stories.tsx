import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
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
  Status,
  Table,
  Verdict,
} from './kit';
import {
  BeforeStill,
  BrowserPlayground,
  CommentStill,
  FullStill,
  MenuStill,
  OpenStill,
  PostUpStill,
  ScrolledStill,
  TodayStill,
  barBenchmarks,
  browserRules,
  browserSequence,
  EdgeControlsStill,
  EdgeControlsFoldedStill,
  EdgeControlsPostUpStill,
} from './browser';
import {
  browserBenchmarks,
  browserConstraints,
  browserGuidance,
  browserSources,
} from './browserResearch';

const meta: Meta = {
  title: 'Mobile UX/6b. Reading the link',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const ReadingTheLink: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What happens when someone opens the article"
        title="The page fills the screen and the post becomes a drawer at the bottom, X's way: title line and actions at rest, actions alone while you read, the post and its comments when you pull it up, the full post page when you pull it to the top."
      >
        <p>
          Tsahi&apos;s call: when a member opens an external link the app should
          behave exactly like X. X&apos;s own words for it: the web page covers
          the post and &quot;the post collapses to the bottom of the page so
          people can react while reading&quot;. So the page is in front and our
          post is the drawer, not the other way round. This chapter has an
          interactive phone, the flow, the rules, and what the wrapper must do,
          with the benchmarks and platform rules that shape it. X only got this
          in October 2025, and had to replace Apple&apos;s Safari view with its
          own web view to do it, because Apple forbids drawing anything over the
          Safari view.
        </p>
        <ChapterNav current="6b" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Revised on Tsahi&apos;s review: the page in front with its small top
        bar, the post as a bottom drawer with four heights (bar, card, post,
        full) that folds while reading and pulls up to the full post page; a
        wrapper feature (WKWebView on iOS, WebView with a bottom sheet on
        Android), the mobile web keeps opening a new tab. Playground on the
        page.
      </Status>

      <Goal
        goal="Reading the source never means leaving the post: one gesture in, one gesture out, and every reaction available while reading."
        metric="Share of link opens that end with a reaction or a return to the post (today the tab switch loses most of them), and time spent in the page."
      />

      <Section
        title="Try it"
        description="Start on the post page and tap Read to watch the post sink into the drawer. Scroll the page, drag the drawer, tap comment, close. The buttons under the phone jump to a state."
      >
        <BrowserPlayground />
      </Section>

      <Section
        title="The flow"
        description="Five steps from the tap to the way back, and the frames."
      >
        <Table
          head={['#', 'You', 'The app']}
          rows={browserSequence.map((row, index) => [
            <span
              key={row[0]}
              className="font-bold tabular-nums text-text-primary"
            >
              {index + 1}
            </span>,
            <span key={`${row[0]}-you`} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <PhoneRow>
          <Cell
            label="Today"
            verdict={Verdict.Skip}
            note="The link leaves the app for Safari (or a system browser view in the wrapper) with its own chrome; the post and its actions are gone until you come back."
          >
            <TodayStill />
          </Cell>
          <Cell
            label="1 · Before the tap"
            note="The post page exactly as chapter 6 decided it: floating back, share and menu on top, the action capsule above the tab bar and Create."
          >
            <BeforeStill />
          </Cell>
          <Cell
            label="2 · The page, the post as a drawer"
            verdict={Verdict.Ship}
            note="On the tap the post page sinks to the bottom and becomes the drawer while the article is revealed behind it, no screen pushed in from the side; the action capsule stays put and the card rises around it. Close, the domain, share and the menu on the page's small bar; the post collapsed at the bottom: grabber, title line, the capsule."
          >
            <OpenStill />
          </Cell>
          <Cell
            label="3 · Reading"
            verdict={Verdict.Ship}
            note="Reading down folds the drawer continuously: the title line folds away and the bar stays exactly as it is, full height, counts showing; a nudge up brings the title back."
          >
            <ScrolledStill />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell
            label="4 · The post pulled up"
            verdict={Verdict.Ship}
            note="Drag the grabber up or tap the title: the post and its comments over the page, the action bar exactly where it was, floating over them as on the post page; drag down and the card closes around it again."
          >
            <PostUpStill />
          </Cell>
          <Cell
            label="4 · Pulled to the top: the full post page"
            verdict={Verdict.Ship}
            note="Keep dragging and the drawer becomes the post page itself, edge to edge, with its floating buttons; only the grabber under the status bar says the link is still behind it. Drag that grabber down to see the page again. A post page opened normally has no grabber and no such gesture."
          >
            <FullStill />
          </Cell>
          <Cell
            label="4 · Comment from the page"
            verdict={Verdict.Ship}
            note="Comment opens the app's full-page composer over everything, with the post as a compact card; Post returns you to the page."
          >
            <CommentStill />
          </Cell>
          <Cell
            label="The menu"
            note="Open in Safari, copy link, back, forward, share the page. Everything about the page that is not a reaction."
          >
            <MenuStill />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The browser controls ride on the drawer"
        description="Tsahi, 1 Oct, from X's in-app browser: its close, domain capsule, reader and reload sit on the drawer's top edge over the dimmed page, one thumb away, and the top of the page is the page. Drawn here for the implementation to follow."
      >
        <PhoneRow>
          <Cell
            label="Before: controls at the top"
            verdict={Verdict.Skip}
            note="The first draft of this chapter kept a page top bar under the status bar: close, the domain, share, menu. Four targets at the far end of the screen."
          >
            <OpenStill />
          </Cell>
          <Cell
            label="Controls on the drawer's edge"
            verdict={Verdict.Ship}
            note="Close on the left, the domain capsule with the page menu in the middle, reader and reload on the right, riding 10px above the drawer. The page runs edge to edge under the status bar."
          >
            <EdgeControlsStill />
          </Cell>
          <Cell
            label="Folded while reading"
            verdict={Verdict.Ship}
            note="Reading down folds the title line away and the controls come down with the drawer; they stay one thumb away at every height."
          >
            <EdgeControlsFoldedStill />
          </Cell>
          <Cell
            label="The post pulled up"
            verdict={Verdict.Ship}
            note="With the post over the page the controls go with the page they belong to; they are back the moment the drawer comes down."
          >
            <EdgeControlsPostUpStill />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="One bar, never redrawn"
        description="Tsahi's question: the post page already has a floating action bar and floating top buttons; where do they go when the page opens, does the drawer need its own row, and should the pulled-up post show the floating bar? The benchmarks agree on one thing: a post has one set of actions that keeps its place and its order while the container around it changes."
      >
        <p className="max-w-[40rem] text-text-tertiary typo-footnote">
          The two placements set aside (a docked row everywhere, and a floating
          card with a grabber) are in the Archive: Later calls, with the
          reasons.
        </p>
        <Table
          head={['Who', 'What they do', 'Lesson']}
          rows={barBenchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="So the decision">
            The post page&apos;s capsule is the constant of the whole flow and
            it is never redrawn: same size, inset, radius and material in every
            state. Before the tap it floats above the tab bar. On Read the page
            sinks behind it, the tab row folds away under it, it settles 8px off
            the bottom exactly as when you read the post, and the drawer card
            rises around it with the title line above. Reading folds only the
            title line away; the bar does not shrink, because its compact form
            exists on the post page to take the tab bar&apos;s slot, and there
            is no slot to take here. Pulling the post up leaves the capsule
            where it is, floating over the post, so the pulled-up post is the
            post page, not a third layout. The top buttons sink with the page:
            the page&apos;s own small bar has close, share and the menu, so
            nothing is lost. A docked edge-to-edge version was tried first and
            looked cut off.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="What this rules out">
            No second row of actions that fades in while the capsule fades out.
            No reshaping the capsule to fit the card: no edge-to-edge, no lost
            radius. No counts hidden in a state the post page does not have. No
            docked row under a pulled-up post, and no floating card with a
            grabber. If the bar ever changes on the post page, it changes here
            the same day, because it is the same component.
          </Callout>
        </div>
      </Section>

      <Section
        title="What others do, and what the platforms allow"
        description="X is the only app that puts the post's actions over the page, and it needed its own web view to do it. Everyone else uses the system browser view (no overlays possible) or a plain in-app web view with only browser chrome."
      >
        <Table
          head={[
            'App',
            'Presentation',
            'Component',
            'Bars and actions',
            'Opt out',
          ]}
          rows={browserBenchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
            row[4],
          ])}
        />
        <Table
          head={[
            '',
            'iOS Safari view',
            'iOS WKWebView',
            'Android Custom Tab',
            'Android WebView',
          ]}
          rows={browserConstraints.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
            row[4],
          ])}
        />
        <Table
          head={['Guidance', 'Says']}
          rows={browserGuidance.map((row) => [
            <a
              key={row[0]}
              href={row[2]}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-text-primary underline"
            >
              {row[0]}
            </a>,
            row[1],
          ])}
        />
        <Callout title="What is verified about X, and what is not">
          Verified: the October 2025 change, the collapsed post at the bottom
          with Like, Reply, Repost and Save, the bar hiding on scroll down and
          returning on scroll up, the switch from the Safari view to a custom
          web view, and the &quot;Use in-app browser&quot; setting. Not verified
          by any written source: whether the browser presents as a card sheet or
          a full cover, and what exactly is on its top bar. The sheet and the
          bar contents here are our design, chosen to match the rest of this
          system.
        </Callout>
        <DigIn title="Sources">
          <ul className="flex flex-col gap-1">
            {browserSources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-secondary underline typo-footnote"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </DigIn>
      </Section>

      <Section
        title="The rules"
        description="Nine lines that make the in-app browser one thing across the app."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={browserRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout
            tone={CalloutTone.Good}
            title="Why the page in front, and why a WKWebView"
          >
            The page is in front and the post is the drawer, so a member can
            upvote or comment without coming back first. It is a WKWebView drawn
            by the wrapper because App Review 5.1.1 vii forbids drawing anything
            over Apple&apos;s Safari view, and a WebView with a bottom sheet on
            Android because a Custom Tab&apos;s toolbar cannot expand into the
            post.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No sheet over the post (the page is the thing you asked for; it gets
            the screen). No drawer that can disappear entirely. No second row of
            browser controls under the actions. No reload, URL field or tab
            switcher on the bar. No trapping: open in the system browser is
            always one tap away, and a setting can make it the default.
          </Callout>
        </div>
        <p className="text-text-tertiary typo-footnote">
          The withdrawn framing (a sheet with our bar over the post, a Custom
          Tab first on Android) is in the{' '}
          <button
            type="button"
            onClick={linkTo(
              'Mobile UX/Archive/Scroll arms, post page and reading',
            )}
            className="font-bold text-text-primary underline"
          >
            Archive: Scroll arms, post page and reading
          </button>
          .
        </p>
        <Quote>The page comes to the post, not the other way round.</Quote>
        <DigIn title="Implementation notes">
          <p>
            The wrapper registers a bridge call openArticle(url, postId). iOS
            pushes a UIViewController with a WKWebView; the top bar is native
            and the drawer is a native bottom sheet with four detents (bar,
            card, post, full) whose content above the action row is the web
            app&apos;s own post view in a second WKWebView, so the discussion is
            exactly the post page. The bridge feeds title, source, counts and
            state and receives upvote, downvote, comment, bookmark, share,
            openExternal and copyLink. Android mirrors it with a WebView and a
            BottomSheetBehavior drawer; a Custom Tab&apos;s bottom toolbar can
            hold actions but cannot expand into the post, so it is not enough
            here. Reading time is reported back the same way the Read button
            reports it. The WKWebView has its own cookie store, so sign-in walls
            behave as in Instagram, and the EU entitlement rules (domain shown,
            default browser one tap away) are met by the top bar and the menu.
            Without the wrapper the web app keeps target=_blank; the bridge
            presence decides at tap time.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="6b" />
      </Section>
    </Page>
  ),
};

export const DevicePlayground: Story = {
  render: () => (
    <BrowserPlayground
      device
      autoplay={new URLSearchParams(window.location.search).has('auto')}
    />
  ),
};
