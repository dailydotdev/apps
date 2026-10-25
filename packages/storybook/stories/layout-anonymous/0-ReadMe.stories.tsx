import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Page, Section, Table } from './kit';

// The review's front page: what broke for anonymous laptop visitors on
// 23 October, why, where it shows, and the fix the other stories draw.

const Code = ({ children }: { children: string }): ReactElement => (
  <code className="rounded-6 bg-surface-float px-1 py-0.5 font-mono text-text-primary typo-footnote">
    {children}
  </code>
);

const ReadMe = (): ReactElement => (
  <Page
    title="Read me first"
    lead={
      <>
        Since 23 October an anonymous visitor on a laptop gets the v2 rail
        <em> and </em>the old global header at the same time. The screenshots in
        the brief (two logos, two searches, Log in / Sign up in a header the
        rail was built to replace) are that state. This folder compares the
        shell before layout v2, in production today, and with the proposed fix,
        on every page a visitor can reach, and lists the decisions the fix
        needs.
      </>
    }
  >
    <Section title="What happened">
      <Table
        head={['When', 'Change', 'Anonymous laptop visitors']}
        rows={[
          [
            'Until 23 Oct 2026',
            <>
              Layout v2 ran as an experiment (<Code>layout_v2_2</Code>, PR #6083
              onwards). The experiment enrolled signed-in laptop sessions only;
              visitors stayed on the control arm.
            </>,
            'Never in the experiment: the v1 chrome — the 64px global header over the 44px icon sidebar — all along.',
          ],
          [
            '23 Oct 2026',
            <>
              PR #7017 graduated layout v2: the flag and the whole v1 chrome (
              <Code>SidebarDesktop</Code>, <Code>MainSection</Code>, …) were
              deleted and <Code>MainLayout</Code> always mounts the v2 rail.
            </>,
            <>
              Got the rail. But <Code>sidebarOwnsHeader</Code> still requires a
              signed-in user, so the global header stayed too. The PR listed
              this under “Product changes to confirm”; nobody confirmed it.
            </>,
          ],
        ]}
      />
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card title="The one line behind it" tone="warning">
          <p>
            <Code>MainLayout.tsx</Code>:{' '}
            <Code>ownsHeaderAudience = isLoggedIn || isExtension</Code>, then{' '}
            <Code>
              sidebarOwnsHeader = isLaptopLayout && ownsHeaderAudience &&
              showSidebar
            </Code>
            . When it is false the layout renders <Code>MainLayoutHeader</Code>{' '}
            (logo, Spotlight pill, Get the app, Log in, Sign up), pads the page
            by 64px and skips the floating card — the v1 arrangement, now around
            a v2 rail.
          </p>
        </Card>
        <Card title="Why the extension does not have this bug">
          <p>
            The extension’s new tab passes <Code>isExtension</Code>, so there
            the rail owns the header for visitors too, and it shows them the
            hijacking cover strip above the card with the sign-in CTAs in the
            feed’s page header (#7035, merged 25 Oct, which replaced the older{' '}
            <Code>ExtensionSignInStrip</Code>). The webapp fix uses a strip
            above the card instead: its pages have no single feed header to put
            the CTAs in.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="What is wrong today, item by item">
      <Table
        head={['#', 'Defect', 'Where it comes from']}
        rows={[
          [
            '1',
            'Two logos: the header’s wordmark, and the rail’s brand mark hidden under it (the header is z-75, the rail z-70).',
            'MainLayoutHeader + SidebarDesktopV2 both mounted.',
          ],
          [
            '2',
            'Two searches: the Spotlight pill in the header and the Search glyph on the rail open the same modal.',
            'Same.',
          ],
          [
            '3',
            'The rail’s open/close toggle (top: 24px) sits under the header, so a visitor cannot pin the panel open; “[” still toggles it blind.',
            'Toggle is absolutely positioned inside the aside.',
          ],
          [
            '4',
            'No floating card and no tinted page: the page runs edge to edge under the header, unlike every signed-in laptop page.',
            'sidebarOwnsHeader false → card classes not applied.',
          ],
          [
            '5',
            'The Streak tab is on the rail. Its panel is the streak hero and today’s quests, both of which need an account; for a visitor it is an empty panel and a link to /game-center.',
            'showGameCenterTab = isGamificationEnabled (a settings default), not gated on login.',
          ],
          [
            '6',
            'The Invite (gift) button leads to /settings/invite, a signed-in page.',
            'SidebarInviteButton renders for everyone.',
          ],
          [
            '7',
            'Sticky offsets are computed for a header that the rail layout does not have (--sticky-header-offset: 4rem), so sticky page strips rest 64px lower than for members.',
            'stickyHeaderOffset branch on sidebarOwnsHeader.',
          ],
          [
            '8',
            'A signed-in session that logs out keeps the rail layout for one commit, then the header appears: the chrome jumps on logout.',
            'Same branch, flipping with isLoggedIn.',
          ],
        ]}
      />
    </Section>

    <Section
      title="Where it shows"
      lead="Laptop and up only (1020px+). Tablet keeps SidebarTablet and phones keep the shell block and bottom bar; neither depends on login for its chrome, and neither changed on 23 October. Story 5 has production screenshots of both, with the links."
    >
      <Table
        head={['Page', 'How a visitor gets there', 'Story']}
        rows={[
          [
            '/posts, /posts/upvoted, …',
            'Their landing page: / redirects anonymous visitors to onboarding, so Explore is home.',
            '1. Explore',
          ],
          [
            '/posts/[id]',
            'Search engines and shared links. The only route the server can pre-render with the rail (the /layout-v2 mirror), today reserved for signed-in cookies.',
            '2. Post page',
          ],
          [
            '/tags, /tags/[tag]',
            'Search engines. The one page with no page strip, so only the chrome says where you are.',
            '3. Directories',
          ],
          [
            '/squads/discover, /squads/[handle]',
            'Search engines and invites. Has its own strip with a New Squad action that asks a visitor to log in.',
            '3. Directories',
          ],
          [
            '/sources, /sources/[source], /users',
            'Search engines. Same shell as /tags and /squads.',
            '— (same chrome)',
          ],
          [
            'Search results, /highlights, /marketplace',
            'From the Explore panel. Same shell.',
            '— (same chrome)',
          ],
        ]}
      />
    </Section>

    <Section
      title="The fix"
      lead="One shell for everyone on a laptop. The rail owns the header regardless of login; what a visitor lacks is an account, not a layout."
    >
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card title="Shell" tone="brand">
          <p>
            <Code>sidebarOwnsHeader = isLaptopLayout && showSidebar</Code>. The
            global header is no longer rendered on laptop at all; the floating
            card, the page strip, the tinted page and the sticky offsets are the
            member’s.
          </p>
        </Card>
        <Card title="Sign-in strip" tone="brand">
          <p>
            A new shared <Code>SignInStrip</Code> (the copy and buttons of the
            extension’s former <Code>ExtensionSignInStrip</Code>), which{' '}
            <Code>MainLayout</Code> renders as the card’s top banner for
            anonymous laptop visitors in the webapp. Sticky at the top, so Log
            in and Sign up stay reachable while the page scrolls — the one thing
            the fixed header did that the rail cannot. Carries Get the app at
            every laptop width, in the same small secondary style as Log in.
          </p>
        </Card>
        <Card title="Rail" tone="brand">
          <ul className="list-disc pl-5">
            <li>
              No account controls on the rail: no avatar slot, no Invite (it
              leads to a signed-in settings page), no Get the app. Support
              stays; Settings stays signed-in only. Log in, Sign up and Get the
              app live in the strip above the card.
            </li>
            <li>
              The <strong>Streak</strong> tab is signed-in only. LFG already is
              (it needs messages).
            </li>
            <li>
              Explore and Squads panels stay: Find Squads, Tags, Sources,
              Marketplace, Leaderboard are a visitor’s navigation. “New Squad”
              keeps asking them to log in.
            </li>
          </ul>
        </Card>
        <Card title="Server shell" tone="brand">
          <p>
            The <Code>dl_v</Code> cookie records “laptop” instead of “logged in
            on a laptop”, so the post page’s mirrored route serves the rail to a
            returning visitor too. A first-ever visit still hydrates from the
            header shell to the rail, as a signed-in hard load of /tags does
            today; that is the one layout shift the fix keeps, and it is already
            the member’s.
          </p>
        </Card>
      </div>
      <Table
        head={['File', 'Change']}
        rows={[
          [
            <Code>shared/src/components/MainLayout.tsx</Code>,
            'Drop the audience from sidebarOwnsHeader; render SignInStrip as the top banner for anonymous laptop sessions (webapp only; the extension keeps #7035’s hijacking cover and feed-header CTAs through topBanner). The strip sticks at top: var(--sticky-header-offset), so the promotional banner never covers it.',
          ],
          [
            <Code>shared/src/components/sidebar/SidebarDesktopV2.tsx</Code>,
            'Invite and the Streak tab gated on isLoggedIn; nothing replaces them for a visitor.',
          ],
          [
            <Code>shared/src/components/auth/SignInStrip.tsx</Code>,
            'New, webapp only: the former ExtensionSignInStrip’s copy and buttons, plus Get the app at every laptop width (same size and style as Log in) and the header’s login event ids.',
          ],
          [
            <Code>shared/src/hooks/layout/useLayoutVariantCookie.ts</Code>,
            'shouldMirror = isLaptop (no login requirement); write once hydrated instead of after boot.',
          ],
          [
            <Code>shared/src/components/layout/MainLayoutHeader.tsx</Code>,
            'Laptop branch unreachable on sidebar pages: keep it for showSidebar=false pages (/articles, squad referral) and below laptop.',
          ],
          [
            <Code>
              webapp/__tests__/MainLayout.tsx, MainLayoutServerVariant.tsx,
              useLayoutVariantCookie.spec.tsx, SidebarDesktopV2.spec.tsx
            </Code>,
            'The “needs a user” cases flip; add the anonymous laptop case.',
          ],
          [
            'Analytics',
            'Keep target_id: "header" on the strip’s Log in / Sign up so the login funnel dashboards do not break.',
          ],
        ]}
      />
    </Section>

    <Section title="Alternatives considered">
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <Card title="Bring the v1 sidebar back for visitors">
          <p>
            Restores the “before” state exactly. Rejected: the v1 chrome was
            deleted with its tests, and it keeps two layouts to maintain — the
            thing #7017 set out to end. It also means a visitor who signs up
            watches the whole shell change under them.
          </p>
        </Card>
        <Card title="Keep the header, hide the rail’s duplicates">
          <p>
            Hide the rail’s logo and search for visitors, move the toggle down.
            Cheapest, still two chromes: no card, no tinted page, a 64px header
            the member never sees, and every future shell change made twice.
          </p>
        </Card>
        <Card title="Rail only, no strip (story 4, “rail-only”)">
          <p>
            Only the bottom signup banner and the login prompts (New Squad, the
            rows that need an account) carry auth. Fewer pixels, but Sign up
            loses its always-visible primary button, which the header has had
            since day one. Shown so the trade is visible; not recommended
            without a test.
          </p>
        </Card>
      </div>
    </Section>

    <Section
      title="Also spotted: the extension’s companion button"
      lead="Not an anonymous-visitor issue, but it is in the same panel and it looks broken for the same reason: it is v1 chrome dropped into v2 without a home."
    >
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card title="What it is" tone="warning">
          <p>
            The lone square under the Explore panel title on the extension’s new
            tab is <Code>CompanionPopupButton</Code>: a one-time nudge to grant
            the companion its content-script permission. It renders only until
            the permission is granted, it has no label, and clicking it opens
            the “Try the new companion feature!” card. In v1 it sat in the
            header’s action row beside the bell; #6083 kept the{' '}
            <Code>additionalButtons</Code> slot and parked it under the panel
            title (<Code>SidebarDesktopV2</Code>, “mt-2 flex items-center gap-1
            px-3”). Nothing else ever uses that slot.
          </p>
        </Card>
        <Card title="Where it should go" tone="brand">
          <ul className="list-disc pl-5">
            <li>
              <strong>The ask:</strong> a TopHero card in{' '}
              <Code>ExtensionTopBanners</Code>, the row above the card where the
              extension already makes its other one-time ask (“Add shortcuts”):
              title, the preview image, Activate, and a close that completes an
              action so it never returns. Same copy as the popover.
            </li>
            <li>
              <strong>The way back:</strong> a labelled row in the Support menu,
              “Enable the companion”, for anyone who dismissed the card. The
              Support menu is where the rail keeps its other “how this works”
              entries.
            </li>
            <li>
              Then delete the <Code>additionalButtons</Code> slot from the
              panel. Separate PR; it does not touch the anonymous shell.
            </li>
          </ul>
        </Card>
      </div>
    </Section>

    <Section title="Decisions to take">
      <Table
        head={['Question', 'Recommendation']}
        rows={[
          [
            'Strip copy',
            '“Sign in to personalize your feed” (Tsahi, 25 Oct), at every width.',
          ],
          [
            'Keep the bottom signup banner on public pages?',
            'Yes, unchanged: it is a tested surface with its own flag history, and it is mutually exclusive with the sponsor dock. The strip and the banner never compete for the same edge.',
          ],
          [
            'Streak tab for visitors',
            'Hide. Its panel needs an account; the tab reads as a feature they can use.',
          ],
          [
            'Theme toggle for visitors',
            'Not in this fix. Neither v1 nor today offered one on laptop (it lived in the profile menu). Settings stays signed-in only.',
          ],
          [
            'Get the app',
            'Strip only, at every laptop width, same size and style as Log in (Tsahi, 25 Oct). Not on the rail: the strip is sticky, so it is always on screen.',
          ],
          [
            'Sidebar tour',
            'Members only, as now (useSidebarTourState already requires a user).',
          ],
          [
            'Extension vs webapp sign-in placement',
            'Keep the split for now: the extension’s new tab leads with the hijacking cover strip and puts Log in / Sign up in the feed header (#7035); the webapp uses the strip above the card because its pages have no single header. Unify later if the team wants one pattern.',
          ],
        ]}
      />
    </Section>

    <Section title="How to read the stories">
      <Table
        head={['Story', 'What it shows']}
        rows={[
          [
            '1. Explore',
            'The brief’s page: the three anonymous shells and the signed-in reference at 1440, 1024 and 1920. Scroll inside each window.',
          ],
          [
            '2. Post page',
            'The mirrored route, the post banner and the comments, in the three shells.',
          ],
          [
            '3. Directories',
            '/tags (no strip) and /squads/discover (its own strip), in the three shells.',
          ],
          [
            '4. States',
            'The proposed shell’s states: the panel peeking open on hover, the panel pinned open, the promotional banner, the 1024 strip, the rail-only alternative, light theme.',
          ],
          [
            '5. Tablet and phone',
            'What a visitor gets below laptop, unchanged by the fix, for completeness.',
          ],
        ]}
      />
      <Card>
        <p>
          Every laptop frame is a real window of that size (an iframe with the
          app’s styles): fixed and sticky chrome behave as in production, and
          the page scrolls inside it. The shells are drawn from production’s
          class recipes (<Code>MainLayout</Code>, <Code>SidebarDesktopV2</Code>,
          the deleted <Code>SidebarDesktop</Code>) with the real buttons, icons,
          logo, grid cards and post page; the rail and header are markup, not
          the live components, which read the top window.
        </p>
      </Card>
    </Section>
  </Page>
);

const meta: Meta<typeof ReadMe> = {
  title: 'Layout v2 anonymous/0. Read me first',
  component: ReadMe,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof ReadMe>;

export const Overview: Story = { name: 'Overview' };
