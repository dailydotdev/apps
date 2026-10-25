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
              onwards). The flag was only evaluated for signed-in laptop
              sessions.
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
            the rail owns the header for visitors too, and it shows them{' '}
            <Code>ExtensionSignInStrip</Code> above the card instead of a
            header. That is the pattern the fix promotes to the webapp.
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
      lead="Laptop and up only (1020px+). Tablet keeps SidebarTablet and phones keep the shell block and bottom bar; neither depends on login for its chrome, and neither changed on 23 October (story 5)."
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
            <Code>ExtensionSignInStrip</Code> moves to shared as{' '}
            <Code>SignInStrip</Code> and <Code>MainLayout</Code> renders it as
            the card’s top banner for anonymous laptop visitors in the webapp as
            it already does in the extension. Sticky at the top, so Log in and
            Sign up stay reachable while the page scrolls — the one thing the
            fixed header did that the rail cannot. Carries Get the app on wide
            laptops.
          </p>
        </Card>
        <Card title="Rail" tone="brand">
          <ul className="list-disc pl-5">
            <li>
              A pinned <strong>Log in</strong> tab (UserIcon) in the avatar’s
              slot: opens the login modal. It never folds into “More”.
            </li>
            <li>
              <strong>Get the app</strong> (the existing QR popover) replaces
              Invite at the bottom; Support stays; Settings stays signed-in
              only.
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
            'Drop the audience from sidebarOwnsHeader; render SignInStrip as the top banner for anonymous laptop sessions (webapp); keep topBanner for the extension.',
          ],
          [
            <Code>shared/src/components/sidebar/SidebarDesktopV2.tsx</Code>,
            'Log in tab (pinned) when !isLoggedIn; Get the app instead of Invite; Streak tab gated on isLoggedIn; reorderable list and overflow budget updated.',
          ],
          [
            <Code>extension/src/newtab/ExtensionSignInStrip.tsx</Code>,
            'Move to shared/src/components/auth/SignInStrip.tsx; the extension keeps its import.',
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
            'The “needs a user” cases flip; add the anonymous laptop case and the Log in tab.',
          ],
          [
            'Analytics',
            'Keep target_id: "header" on the strip’s Log in / Sign up so the login funnel dashboards do not break; the rail tab logs target_id: "sidebar".',
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
            The Log in tab and the bottom signup banner carry all of auth. Fewer
            pixels, but Sign up loses its always-visible primary button, which
            the header has had since day one. Shown so the trade is visible; not
            recommended without a test.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Decisions to take">
      <Table
        head={['Question', 'Recommendation']}
        rows={[
          [
            'Strip copy',
            '“Sign in to personalize your feed and save what matters.” (the extension’s line). A shorter line at 1024.',
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
            'Rail bottom (always) and strip (laptopL and up). The header had it at every laptop width; the rail slot keeps that promise at 1024.',
          ],
          [
            'Sidebar tour',
            'Members only, as now (useSidebarTourState already requires a user).',
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
            'The proposed shell’s states: hover panels, the panel pinned open, the promotional banner, the 1024 strip, the rail-only alternative, light theme.',
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
