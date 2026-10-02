import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  DigIn,
  Feasibility,
  FeasibilityPill,
  Goal,
  Page,
  PageHeader,
  Row,
  Section,
  Table,
  ChapterStatus,
  Status,
} from './kit';

const meta: Meta = {
  title: 'Mobile UX/8. Native wrappers',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const capabilities: [string, string, Feasibility, string][] = [
  ['New tab bar, Explore and You hubs', 'Plain web', Feasibility.Web, 'Ships to web, iOS and Android at once behind mobile_nav_v2.'],
  ['Collapsing header, PageBar', 'Plain web', Feasibility.Web, 'Uses the existing --safe-area-top for the ios class.'],
  ['Push and pop transitions', 'View Transitions API', Feasibility.Web, 'Safari 18+ (iOS 18), Chrome 111+. Both wrappers run the system WebView, so current devices qualify; older ones get a cut.'],
  ['Axis-locked swipe, pager segments', 'Touch events', Feasibility.Web, 'Also fixes the reported bug on the mobile web.'],
  ['Pull to refresh', 'Touch events + query refetch', Feasibility.IosBridge, 'iOS wrapper must stop its own reload control and set bounces = true; Android must not add a SwipeRefreshLayout.'],
  ['Haptics', 'Bridge on iOS, Vibration API on Android', Feasibility.IosBridge, 'One new message handler ("haptic") calling UIImpactFeedbackGenerator. navigator.vibrate never works in Safari or WKWebView.'],
  ['In-app browser for article links', 'SFSafariViewController / Custom Tabs', Feasibility.Android, 'iOS already presents SFSafariViewController for non-allowed origins. Android behaviour is unverified.'],
  ['Back gesture', 'WKWebView pop gesture / Android predictive back', Feasibility.Android, 'iOS edge swipe is on. Android needs OnBackPressedCallback wired to canGoBack(), with a bridge message at roots.'],
  ['Scroll restoration on back', 'history + react-query cache', Feasibility.Web, 'Also what makes the iOS peel snapshot less stale.'],
  ['Share sheet', 'navigator.share', Feasibility.Web, 'Works in WKWebView and Android WebView with a user gesture; already used via shouldUseNativeShare.'],
  ['Status bar colour follows theme', 'adaptiveUIStyle', Feasibility.Web, 'iOS wrapper already reads the WebView background. Android to verify.'],
  ['Keyboard-aware composer', 'visualViewport', Feasibility.Web, 'interactive-widget has not shipped in WebKit; visualViewport is the only option.'],
  ['System tab bar with Liquid Glass, system large titles', 'UIKit only', Feasibility.Native, 'Not available to a WebView. We approximate: minimize on scroll, blur, scroll-edge hairline.'],
  ['App review prompt, badge on app icon', 'Bridge', Feasibility.IosBridge, 'Nice to have after phase 3: SKStoreReviewController after a streak milestone.'],
];

export const NativeWrappers: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What can a WebView app do, and what needs the wrapper?"
        title="Almost all of this review is web work. Two behaviours need five lines in the iOS wrapper, and Android needs a back contract before anything else."
      >
        <p>
          Both store apps load the webapp shell in a system WebView. The iOS
          wrapper (dailydotdev/ios) has a real JavaScript bridge; the Android
          one, as far as the web code can tell, has none. This chapter lists
          what each wrapper does today, what each proposal needs, and what a
          WebView cannot do no matter what.
        </p>
        <ChapterNav current="8" />
      </PageHeader>

      <Status status={ChapterStatus.Reference} round="1">
        What each wrapper can do; the four bridge messages. Unchanged.
      </Status>

      <Goal
        goal="Scope every recommendation honestly by platform so nothing in chapters 3 to 7 is a surprise to the mobile engineers."
        metric="Parity checklist: each row below is green on iOS and Android, or explicitly out of scope."
      />

      <Section
        title="How the web layer knows where it runs"
        description="From packages/shared/src/lib and the wrapper's Swift."
      >
        <div className="grid gap-6 tablet:grid-cols-2">
          <div className="rounded-16 border border-border-subtlest-tertiary p-5">
            <span className="font-bold typo-title3">iOS</span>
            <Row label="Detection">
              isIOSNative(): window.webkit.messageHandlers exists and html has
              the ios class, which the wrapper injects at document end.
            </Row>
            <Row label="User agent">Mobile Safari UA with a PWAShell suffix.</Row>
            <Row label="Cookie">app-platform = iOS App Store, read by the API.</Row>
            <Row label="Bridge">
              native-auth, update-user-id, track-event, push-state /
              subscribe / unsubscribe / user-id, iap-* (StoreKit 2),
              app-icon-get / set, print.
            </Row>
            <Row label="WebView">
              displayMode fullscreen, contentInsetAdjustmentBehavior never,
              bounces false, allowsBackForwardNavigationGestures true,
              adaptiveUIStyle on, pull to refresh via a native control that
              reloads the page.
            </Row>
            <Row label="Links">
              Allowed origins stay in the WebView; auth origins open a modal;
              anything else opens SFSafariViewController.
            </Row>
          </div>
          <div className="rounded-16 border border-border-subtlest-tertiary p-5">
            <span className="font-bold typo-title3">Android</span>
            <Row label="Detection">
              A ?android= query on first load, persisted as isAndroidApp in
              the boot cache. Nothing at runtime.
            </Row>
            <Row label="Bridge">None visible from the web layer.</Row>
            <Row label="Back">
              Unknown. If the activity intercepts KEYCODE_BACK, Android 16
              (targetSdk 36) stops delivering it; if it does nothing, system
              back exits the app from a post.
            </Row>
            <Row label="Pull to refresh, status bar, in-app browser">
              Unverified. Needs a look at the Android project before phase 4.
            </Row>
            <Row label="Platform header">
              getDailyClientPlatform sends X-Daily-Client from the ios /
              android / pwa version.
            </Row>
          </div>
        </div>
      </Section>

      <Section
        title="Capability matrix"
        description="Every proposal in this review, what it relies on, and who has to do work."
      >
        <Table
          head={['Proposal', 'Relies on', 'Needs', 'Note']}
          rows={capabilities.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            <FeasibilityPill key="f" feasibility={row[2]} />,
            row[3],
          ])}
        />
        <div className="flex flex-wrap gap-2 text-text-tertiary typo-caption1">
          <FeasibilityPill feasibility={Feasibility.Web} /> ships from this repo ·
          <FeasibilityPill feasibility={Feasibility.IosBridge} /> a small change in dailydotdev/ios ·
          <FeasibilityPill feasibility={Feasibility.Android} /> work in the Android wrapper ·
          <FeasibilityPill feasibility={Feasibility.Native} /> not possible in a WebView
        </div>
      </Section>

      <Section
        title="The bridge additions"
        description="Kept to four messages, symmetrical on both platforms, all optional for the web layer."
      >
        <Table
          head={['Message', 'Direction', 'Payload', 'Used by']}
          rows={[
            ['haptic', 'web → native', '{ style: "light" | "medium" | "success" }', 'Tab change, upvote, bookmark, streak'],
            ['nav-state', 'web → native', '{ canGoBack: boolean, tab: string }', 'Android OnBackPressedCallback; iOS ignores it'],
            ['refresh', 'native → web', 'none', 'Only if a wrapper keeps a native pull control; otherwise unused'],
            ['open-external', 'web → native', '{ url }', 'Explicit in-app browser for article links on Android'],
          ].map((row) => [
            <code key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </code>,
            row[1],
            <code key="p">{row[2]}</code>,
            row[3],
          ])}
        />
        <DigIn title="iOS specifics">
          <p>
            Turn bounces back on once the web layer owns pull to refresh,
            otherwise the feed cannot rubber-band and the pull gesture has
            nothing to hook. Keep contentInsetAdjustmentBehavior never; the
            web layer handles the notch through --safe-area-top. The edge
            swipe pops WebKit history, which is our stack, so it needs no
            bridge; its peel shows WebKit&apos;s own snapshot of the previous
            entry, which improves as soon as the web layer restores from
            cache before paint.
          </p>
        </DigIn>
        <DigIn title="Android specifics">
          <p>
            Opt into predictive back (android:enableOnBackInvokedCallback),
            register an OnBackPressedCallback that is enabled while the
            WebView canGoBack(), and at a root let the web layer decide via
            nav-state whether back should switch to Home or exit. Confirm
            article links open a Custom Tab and not the WebView itself, and
            confirm there is no SwipeRefreshLayout wrapping the WebView, which
            misfires on nested scroll.
          </p>
        </DigIn>
      </Section>

      <Section title="What we do not attempt">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="A native tab bar over the WebView">
            Tempting for Liquid Glass, but it splits navigation state across
            two runtimes, breaks the mobile web, and every peer WebView app
            that tried it (Forem included) kept the web header anyway.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Two custom Open-in-app banners">
            iOS Safari already shows the native Smart App Banner from the
            apple-itunes-app meta; inside the wrapper the Get App button is
            hidden. Nothing in this review adds a banner.
          </Callout>
        </div>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="8" />
      </Section>
    </Page>
  ),
};
