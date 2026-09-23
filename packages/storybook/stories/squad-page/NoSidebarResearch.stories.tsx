import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { KitStyles } from './kit';

const meta: Meta = {
  title: 'Squad Page/7. No sidebar research',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

// Desk research behind the no-sidebar direction: what the usability
// literature says about replacing a pages column with in-page structure,
// what thirty products do on a profile, community or organization page
// that never had a sidebar, and ten ways to seat the sidebar's load in the
// page, scored against that evidence. Ends with the composite written out
// region by region.

/* ------------------------------------------------------------ furniture */

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
    <KitStyles />
    <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-16">
      {children}
    </div>
  </div>
);

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

const Prose = ({
  children,
  wide,
}: {
  children: ReactNode;
  wide?: boolean;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-3 text-text-secondary typo-body',
      wide ? 'max-w-[100ch]' : 'max-w-[76ch]',
    )}
  >
    {children}
  </div>
);

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-bold typo-title1">{title}</h2>
    </div>
    {children}
  </section>
);

const Table = ({
  head,
  rows,
  minWidth = '60rem',
}: {
  head: string[];
  rows: ReactNode[][];
  minWidth?: string;
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full border-collapse text-left" style={{ minWidth }}>
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-secondary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'px-4 py-3 typo-footnote',
                  cellIndex === 0
                    ? 'whitespace-nowrap font-bold text-text-primary'
                    : 'text-text-tertiary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* -------------------------------------------------------------- sources */

const sources = {
  nngHamburger: {
    label: 'NN/g, Hamburger menus and hidden navigation hurt UX metrics',
    href: 'https://www.nngroup.com/articles/hamburger-menus/',
  },
  nngVertical: {
    label: 'NN/g, Left-side vertical navigation on desktop',
    href: 'https://www.nngroup.com/articles/vertical-nav/',
  },
  nngLocal: {
    label: 'NN/g, Local navigation',
    href: 'https://www.nngroup.com/articles/local-navigation/',
  },
  nngUniversal: {
    label: 'NN/g, Universal navigation: connecting subsites',
    href: 'https://www.nngroup.com/articles/universal-navigation/',
  },
  nngTabs: {
    label: 'NN/g, Tabs, used right',
    href: 'https://www.nngroup.com/articles/tabs-used-right/',
  },
  nngUtility: {
    label: 'NN/g, Utility navigation',
    href: 'https://www.nngroup.com/articles/utility-navigation/',
  },
  nngSticky: {
    label: 'NN/g, Sticky headers: 5 ways to make them better',
    href: 'https://www.nngroup.com/articles/sticky-headers/',
  },
  nngScroll: {
    label: 'NN/g, Scrolling and attention',
    href: 'https://www.nngroup.com/articles/scrolling-and-attention/',
  },
  nngRail: {
    label: 'NN/g, Fight against right-rail blindness',
    href: 'https://www.nngroup.com/articles/fight-right-rail-blindness/',
  },
  nngCategory: {
    label: 'NN/g, Traditional and hybrid category pages',
    href: 'https://www.nngroup.com/articles/category-pages/',
  },
  nngDisclosure: {
    label: 'NN/g, Progressive disclosure',
    href: 'https://www.nngroup.com/articles/progressive-disclosure/',
  },
  nngInPage: {
    label: 'NN/g, In-page links for content navigation',
    href: 'https://www.nngroup.com/articles/in-page-links-content-navigation/',
  },
  nngAccordions: {
    label: 'NN/g, Accordions on desktop',
    href: 'https://www.nngroup.com/articles/accordions-on-desktop/',
  },
  nngInfinite: {
    label: 'NN/g, Infinite scrolling: when to use it',
    href: 'https://www.nngroup.com/articles/infinite-scrolling-tips/',
  },
  nngScent: {
    label: 'NN/g, Information scent',
    href: 'https://www.nngroup.com/articles/information-scent/',
  },
  nngSubnav: {
    label: 'NN/g, Mobile subnavigation',
    href: 'https://www.nngroup.com/articles/mobile-subnavigation/',
  },
  nngCarousel: {
    label: 'NN/g, Carousel usability',
    href: 'https://www.nngroup.com/articles/designing-effective-carousels/',
  },
  smashingSticky: {
    label: 'Smashing, Sticky menus are quicker to navigate',
    href: 'https://www.smashingmagazine.com/2012/09/sticky-menus-are-quicker-to-navigate/',
  },
  stickyCta: {
    label: 'Online Dialogue, A sticky CTA: guaranteed uplift?',
    href: 'https://www.onlinedialogue.nl/en/blogs/sticky-cta-guaranteed-conversion-uplift/',
  },
  priorityPlus: {
    label: 'Brad Frost, Revisiting the Priority+ pattern',
    href: 'https://bradfrost.com/blog/post/revisiting-the-priority-pattern/',
  },
  baymardToolbar: {
    label: 'Baymard, Be careful with horizontal filtering toolbars',
    href: 'https://baymard.com/blog/horizontal-filtering-sorting-design',
  },
  baymardFilters: {
    label: 'Baymard, Consider promoting important filters',
    href: 'https://baymard.com/blog/promoting-product-filters',
  },
  baymardCarousel: {
    label: 'Baymard, 10 UX requirements for homepage carousels',
    href: 'https://baymard.com/blog/homepage-carousel',
  },
  baymardViewAll: {
    label: 'Baymard, View all at each level',
    href: 'https://baymard.com/blog/mobile-main-nav-view-all',
  },
  baymardInline: {
    label: 'Baymard, Avoid inline scroll areas',
    href: 'https://baymard.com/blog/inline-scroll-areas',
  },
  primerNav: {
    label: 'Primer, UnderlineNav guidelines',
    href: 'https://primer.style/product/components/underline-nav/guidelines/',
  },
  primerPatterns: {
    label: 'Primer, Navigation pattern',
    href: 'https://primer.style/product/ui-patterns/navigation/',
  },
  primerHeader: {
    label: 'Primer, PageHeader guidelines',
    href: 'https://primer.style/product/components/page-header/guidelines/',
  },
  atlassianTabs: {
    label: 'Atlassian Design System, Tabs',
    href: 'https://atlassian.design/components/tabs/usage',
  },
  carbonTabs: {
    label: 'IBM Carbon, Tabs',
    href: 'https://carbondesignsystem.com/components/tabs/usage/',
  },
  higTabs: {
    label: 'Apple HIG, Tab bars',
    href: 'https://developer.apple.com/design/human-interface-guidelines/tab-bars',
  },
  m2Tabs: {
    label: 'Material, Tabs (scrollable)',
    href: 'https://m2.material.io/components/tabs',
  },
  govukTabs: {
    label: 'GOV.UK Design System, Tabs',
    href: 'https://design-system.service.gov.uk/components/tabs/',
  },
  govukSecondary: {
    label: 'GOV.UK prototype, Secondary navigation',
    href: 'https://govuk-prototype-components.x-govuk.org/secondary-navigation',
  },
  polarisPage: {
    label: 'Shopify Polaris, Page',
    href: 'https://polaris.shopify.com/components/layout-and-structure/page',
  },
  redditWidgets: {
    label: 'Reddit help, Sidebar widgets',
    href: 'https://support.reddithelp.com/hc/en-us/articles/15484474697748-Sidebar-Widgets',
  },
  redditPostCheck: {
    label: 'TechCrunch, Reddit adds Post Check',
    href: 'https://techcrunch.com/2025/03/06/reddit-adds-new-tools-to-help-users-contribute-and-connect-across-its-platform',
  },
  redditLoggedOut: {
    label: 'TechCrunch, Reddit redesign for logged-out users',
    href: 'https://techcrunch.com/2023/08/01/reddit-updates-its-site-design-for-logged-out-users/',
  },
  githubOrg: {
    label: 'GitHub docs, Customizing your organization profile',
    href: 'https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile',
  },
  githubVerified: {
    label: 'GitHub docs, Verifying a domain',
    href: 'https://docs.github.com/en/organizations/managing-organization-settings/verifying-or-approving-a-domain-for-your-organization',
  },
  hfCards: {
    label: 'Hugging Face docs, Organization cards',
    href: 'https://huggingface.co/docs/hub/organizations-cards',
  },
  patreonPage: {
    label: 'Patreon, Introducing your updated creator page',
    href: 'https://www.patreon.com/posts/introducing-your-137122636',
  },
  youtubeLayout: {
    label: 'YouTube help, Customize channel layout',
    href: 'https://support.google.com/youtube/answer/3219384?hl=en',
  },
  youtubeTabs: {
    label: 'TechCrunch, YouTube gives Shorts and Live their own tabs',
    href: 'https://techcrunch.com/2022/10/27/youtube-redesign-gives-long-form-videos-shorts-and-live-videos-their-own-tabs-on-channel-pages/',
  },
  igHighlights: {
    label: 'PiunikaWeb, Instagram moves Highlights to a tab',
    href: 'https://piunikaweb.com/2025/09/12/instagram-highlights-moved-to-main-grid/',
  },
  igDashboard: {
    label: 'Inrō, Instagram professional dashboard',
    href: 'https://www.inro.social/blog/instagram-dashboard-professional-dashboard-guide',
  },
  xOrgs: {
    label: 'X help, Premium Organizations and affiliates',
    href: 'https://help.x.com/en/using-x/premium-organizations',
  },
  x2026: {
    label: 'Roboin, X profile tabs redesign (July 2026)',
    href: 'https://roboin.io/article/en/2026/07/17/why-reposts-and-replies-are-not-showing-on-x/',
  },
  bskyVerify: {
    label: 'Bluesky, A new form of verification',
    href: 'https://bsky.social/about/blog/04-21-2025-verification',
  },
  linkedinAdmin: {
    label: 'LinkedIn help, Page admin view',
    href: 'https://www.linkedin.com/help/linkedin/answer/a548316',
  },
  phRedesign: {
    label: 'Product Hunt forum, Thoughts on the product hub redesign',
    href: 'https://www.producthunt.com/p/producthunt/thoughts-on-the-new-product-hub-redesign',
  },
  ksRewards: {
    label: 'Kickstarter, Introducing the Rewards tab',
    href: 'https://updates.kickstarter.com/introducing-the-new-kickstarter-rewards-tab-a-user-friendly-solution-for-backers-to-explore-project-rewards-and-add-ons/',
  },
  skoolTabs: {
    label: 'Skool, Show or hide tabs',
    href: 'https://www.skool.com/skool-monetization-strategies-2218/how-to-show-or-hide-tabs-in-your-skool-community-simplify-your-layout-in-60-seconds',
  },
  whopApp: {
    label: 'Whop iOS release notes, tabbed company page',
    href: 'https://apps.apple.com/us/app/whop/id1600181492',
  },
  twitchPanels: {
    label: 'Twitch help, Info panels',
    href: 'https://help.twitch.tv/s/article/how-to-edit-info-panels',
  },
  twitchRedesign: {
    label: 'Engadget, Twitch channel page redesign',
    href: 'https://www.engadget.com/twitch-channel-page-redesign-170032083.html',
  },
  discordGuide: {
    label: 'Discord help, Server Guide',
    href: 'https://support.discord.com/hc/en-us/articles/13497665141655-Server-Guide-FAQ',
  },
  discordMobile: {
    label: 'Engadget, Discord mobile redesign',
    href: 'https://www.engadget.com/discord-overhauls-its-mobile-app-with-new-tabs-messaging-features-and-more-170035917.html',
  },
  steamHub: {
    label: 'Steamworks, Community hubs',
    href: 'https://partner.steamgames.com/doc/features/community',
  },
  wellfound: {
    label: 'Wellfound help, Edit my company profile',
    href: 'https://help.wellfound.com/article/711-how-do-i-edit-my-company-profile',
  },
  soCollectives: {
    label: 'Stack Overflow blog, A design deep dive into Collectives',
    href: 'https://stackoverflow.blog/2021/07/26/a-design-deep-dive-into-how-we-created-collectives/',
  },
  devto: {
    label: 'Forem docs, Organization pages',
    href: 'https://admin.forem.com/docs/managing-your-community/organization-pages',
  },
  bento: {
    label: 'Rajesh Nair, Bento grids critique (2026)',
    href: 'https://rajeshrnair.com/blog/design/ui-ux/ui-design-trends-2026-bento-grids-glassmorphism.html',
  },
} as const;

type SourceKey = keyof typeof sources;

const Cite = ({ k, short }: { k: SourceKey; short?: string }): ReactElement => (
  <a
    href={sources[k].href}
    target="_blank"
    rel="noreferrer"
    className="text-text-link hover:underline"
  >
    {short ?? sources[k].label}
  </a>
);

/* ------------------------------------------------------------- wireframe */

type Tone = 'chrome' | 'nav' | 'cta' | 'feed' | 'info' | 'manage' | 'muted';

interface Block {
  l: string;
  s?: number;
  h?: number;
  t?: Tone;
  stack?: Block[];
}

const tones: Record<Tone, string> = {
  chrome: 'bg-surface-float text-text-secondary',
  nav: 'bg-accent-cabbage-flat font-bold text-accent-cabbage-default',
  cta: 'bg-text-primary font-bold text-background-default',
  feed: 'border border-border-subtlest-tertiary text-text-quaternary',
  info: 'bg-accent-bun-flat text-accent-bun-default',
  manage:
    'border border-dashed border-accent-cheese-default text-accent-cheese-default',
  muted: 'bg-surface-hover text-text-quaternary',
};

const toneLabel: Record<Tone, string> = {
  chrome: 'Identity and utilities',
  nav: 'Navigation',
  cta: 'Primary action',
  feed: 'Content',
  info: 'Support (rules, team, links)',
  manage: 'Team only',
  muted: 'daily.dev chrome',
};

const BlockView = ({ block }: { block: Block }): ReactElement => (
  <div
    style={{
      gridColumn: `span ${block.s ?? 12}`,
      minHeight: `${block.h ?? 1.5}rem`,
    }}
    className={classNames(
      'flex flex-col rounded-8',
      block.stack ? 'gap-1' : 'items-center justify-center px-1 text-center',
      block.stack ? '' : tones[block.t ?? 'feed'],
      'typo-caption2',
    )}
  >
    {block.stack
      ? block.stack.map((child, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={{ minHeight: `${child.h ?? 1.5}rem` }}
            className={classNames(
              'flex flex-1 items-center justify-center rounded-8 px-1 text-center typo-caption2',
              tones[child.t ?? 'feed'],
            )}
          >
            {child.l}
          </div>
        ))
      : block.l}
  </div>
);

const Frame = ({
  rows,
  className,
  caption,
}: {
  rows: Block[][];
  className?: string;
  caption: string;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-2', className)}>
    <div className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-default p-1.5">
      {rows.map((row, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className="grid grid-cols-12 gap-1">
          {row.map((block, blockIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <BlockView key={blockIndex} block={block} />
          ))}
        </div>
      ))}
    </div>
    <span className="text-center text-text-quaternary typo-caption2">
      {caption}
    </span>
  </div>
);

const chrome: Block[] = [
  { l: 'daily.dev header and rail', t: 'muted', h: 1.25 },
];
const banner: Block[] = [{ l: 'Banner', t: 'chrome', h: 2 }];
const identity = (cta = 'Follow'): Block[] => [
  {
    l: 'Avatar · CodeRabbit ✓ · coderabbit.ai · Developer tools · San Francisco · Since 2023 · 6.1k followers',
    s: 8,
    t: 'chrome',
    h: 2.25,
  },
  { l: cta, s: 2, t: 'cta', h: 2.25 },
  { l: 'Bell · Share · More', s: 2, t: 'chrome', h: 2.25 },
];
const mobileIdentity = (cta = 'Follow'): Block[][] => [
  [{ l: 'Banner · avatar · CodeRabbit ✓ · meta', t: 'chrome', h: 2.5 }],
  [
    { l: cta, s: 8, t: 'cta' },
    { l: 'More', s: 4, t: 'chrome' },
  ],
];
const feed = (h = 6, s = 8): Block => ({ l: 'Posts feed', s, h, t: 'feed' });
const supportColumn = (extra: Block[] = []): Block => ({
  l: '',
  s: 4,
  stack: [
    { l: 'Official company page', t: 'info' },
    { l: 'Rules', t: 'info' },
    { l: 'Team 8', t: 'info' },
    { l: 'Links', t: 'info' },
    ...extra,
  ],
});

/* ------------------------------------------------------------ variations */

interface Variation {
  id: string;
  title: string;
  after: string;
  carries: string;
  strengths: string;
  costs: string;
  evidence: ReactNode;
  bestWhen: string;
  desktop: Block[][];
  desktopCaption: string;
  mobile: Block[][];
  mobileCaption: string;
}

const variations: Variation[] = [
  {
    id: 'tabs',
    title: 'Profile tabs',
    after: 'X profile, GitHub organization, Hugging Face organization',
    carries:
      'One underline row under the identity block: Posts, Releases, Products, Discussions, Polls. Rules, Team and Links are cards beside the feed on Posts only. Followers opens from the count. Manage is a menu on the header.',
    strengths:
      'The pattern every visitor already knows. Areas are routed pages with their own URL, one preselected, which is what secondary navigation is supposed to be. The feed dominates Home.',
    costs:
      'The row holds five comfortably and six at most. Rules and FAQ never get a tab, so on mobile they drop below the feed where an infinite list can bury them.',
    evidence: (
      <>
        <Cite k="nngTabs" short="NN/g on tabs" /> (one row, one or two word
        labels, high-use tab first);{' '}
        <Cite k="primerNav" short="Primer UnderlineNav" /> (every tab a URL,
        counts allowed); <Cite k="githubOrg" short="GitHub org profile" />.
      </>
    ),
    bestWhen: 'The page count stays at five or six and Home must be the feed.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        { l: 'Posts', s: 2, t: 'nav' },
        { l: 'Releases', s: 2, t: 'nav' },
        { l: 'Products', s: 3, t: 'nav' },
        { l: 'Discussions', s: 3, t: 'nav' },
        { l: 'Polls', s: 2, t: 'nav' },
      ],
      [feed(), supportColumn()],
    ],
    desktopCaption: 'Desktop, Posts tab',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [{ l: 'Posts · Releases · Products · Discu…', t: 'nav' }],
      [feed(4, 12)],
      [{ l: 'Rules · Team · Links below the feed', t: 'info' }],
    ],
    mobileCaption: 'Phone, row scrolls',
  },
  {
    id: 'counted',
    title: 'Counted tabs, Priority+',
    after:
      'Product Hunt product hub, Kickstarter project, GitHub Settings and Teams tabs, Primer overflow',
    carries:
      'The row carries everything the sidebar had: Posts, Releases 14, Products, Discussions 38, Polls, About, and Followers 6.1k. What does not fit the width folds right to left into a worded More. Admins get Manage 3 appended at the end of the same row, visible only to them.',
    strengths:
      'Nothing is hidden that could be shown, and the hidden remainder is one labelled click away, which tests as well as fully visible navigation. Counts give every tab scent. It grows without a redesign: a new page is a new tab that lands in More on narrow screens.',
    costs:
      'More is overlooked by some people the way "All filters" is, so only low-traffic pages may live there. The admin tab sits in the visitor row, which must be styled as a different kind of thing.',
    evidence: (
      <>
        <Cite k="nngHamburger" short="NN/g hidden navigation study" /> (combo
        navigation matches visible: 50% vs 48% usage on desktop);{' '}
        <Cite k="priorityPlus" short="Priority+ pattern" />;{' '}
        <Cite k="baymardToolbar" short="Baymard on overlooked More buttons" />;{' '}
        <Cite k="ksRewards" short="Kickstarter Rewards tab" /> (tabs with counts
        added because people jumped back and forth);{' '}
        <Cite k="githubOrg" short="GitHub role-gated tabs" />.
      </>
    ),
    bestWhen:
      'The page will grow past six areas and the team wants Manage one click from the public page.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        { l: 'Posts', s: 1, t: 'nav' },
        { l: 'Releases 14', s: 2, t: 'nav' },
        { l: 'Products', s: 2, t: 'nav' },
        { l: 'Discussions 38', s: 2, t: 'nav' },
        { l: 'Polls', s: 1, t: 'nav' },
        { l: 'About', s: 1, t: 'nav' },
        { l: 'More ▾', s: 1, t: 'nav' },
        { l: 'Manage 3', s: 2, t: 'manage' },
      ],
      [feed(), supportColumn()],
    ],
    desktopCaption: 'Desktop, admin view; More holds Followers',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [
        { l: 'Posts · Releases 14 · Produ…', s: 9, t: 'nav' },
        { l: 'More', s: 3, t: 'nav' },
      ],
      [feed(4, 12)],
      [{ l: 'Cards fold into About', t: 'info' }],
    ],
    mobileCaption: 'Phone, three visible plus More',
  },
  {
    id: 'condensing',
    title: 'Condensing header',
    after: 'YouTube channel, LinkedIn Page on mobile, X, Instagram',
    carries:
      'Any tab variant, plus a scroll rule: when the tab row reaches the top it sticks, and the hero collapses into it. Avatar, name, seal, Follow and the row become one 48px bar. The bell, share and More stay in the bar as icons.',
    strengths:
      'The one thing the sidebar did that a header cannot, being there at every scroll depth, comes back without spending a column. Sticky menus tested 22% faster and were preferred by every participant who had a preference. Follow is always in reach without a second sticky bar.',
    costs:
      'Every sticky pixel is paid on every page. Keep the bar to one row of readable text and tappable targets, opaque, and animate the collapse at scroll speed. On phones prefer a bar that hides on scroll-down and returns on scroll-up.',
    evidence: (
      <>
        <Cite k="nngSticky" short="NN/g sticky headers" />;{' '}
        <Cite k="smashingSticky" short="Smashing sticky menu study" />;{' '}
        <Cite k="stickyCta" short="Online Dialogue sticky CTA tests" /> (a
        second sticky CTA bar on listing pages won 0 of the tests);{' '}
        <Cite k="youtubeLayout" short="YouTube channel layout" />.
      </>
    ),
    bestWhen: 'Always. This is a behaviour to add to whichever variant wins.',
    desktop: [
      chrome,
      [
        { l: 'Avatar · CodeRabbit ✓', s: 3, t: 'chrome', h: 1.75 },
        {
          l: 'Posts · Releases 14 · Products · Discussions 38 · Polls · About',
          s: 6,
          t: 'nav',
          h: 1.75,
        },
        { l: 'Follow', s: 2, t: 'cta', h: 1.75 },
        { l: 'Bell · ⋯', s: 1, t: 'chrome', h: 1.75 },
      ],
      [feed(7), supportColumn()],
    ],
    desktopCaption: 'Desktop, scrolled: hero collapsed into the sticky bar',
    mobile: [
      chrome,
      [
        { l: 'CodeRabbit ✓', s: 7, t: 'chrome' },
        { l: 'Follow', s: 5, t: 'cta' },
      ],
      [{ l: 'Posts · Releases · Products…', t: 'nav' }],
      [feed(6, 12)],
    ],
    mobileCaption: 'Phone, scrolled: returns on scroll-up',
  },
  {
    id: 'home',
    title: 'Curated Home, raw Posts',
    after: 'Patreon Home vs Posts, YouTube channel Home, Steam hub All tab',
    carries:
      'Home is a stack of owner-ordered shelves: pinned highlights, the latest release, the products, the poll of the week, the latest posts, each with "See all releases 14" and a clipped last card. Posts is the raw feed next to it. Releases, Products, Discussions and Polls keep their tabs.',
    strengths:
      'A fed page always looks alive. Everything the company offers is visible in one scroll, which is the strongest sell to a prospect. Patreon made this its default for everyone, members included, and YouTube gives Home twelve sections.',
    costs:
      'The feed no longer dominates Home; it starts one tab away. Shelves must never be the only route, most people never see past the first card, and each shelf needs a literal See all with its count. Twice the surface to keep tidy when the squad is young.',
    evidence: (
      <>
        <Cite k="patreonPage" short="Patreon updated creator page" /> (Home is
        what everyone sees first, Posts is chronological);{' '}
        <Cite k="youtubeLayout" short="YouTube Home sections" />;{' '}
        <Cite k="baymardCarousel" short="Baymard on carousels" />;{' '}
        <Cite k="baymardViewAll" short="Baymard on explicit View all" />;{' '}
        <Cite k="nngCarousel" short="NN/g carousel usability" /> (five frames,
        position shown, no autoplay on mobile).
      </>
    ),
    bestWhen:
      'The page is a showcase first and a community second, and the feed delivers steadily enough to fill the shelves.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        { l: 'Home', s: 2, t: 'nav' },
        { l: 'Posts', s: 2, t: 'nav' },
        { l: 'Releases', s: 2, t: 'nav' },
        { l: 'Products', s: 2, t: 'nav' },
        { l: 'Discussions', s: 2, t: 'nav' },
        { l: 'Polls', s: 2, t: 'nav' },
      ],
      [
        {
          l: '',
          s: 8,
          stack: [
            { l: 'Pinned: CodeRabbit Triage · Latest release', t: 'feed' },
            { l: 'Products shelf, See all 6 →', t: 'feed' },
            { l: 'Poll of the week', t: 'feed' },
            { l: 'Latest posts, See all →', t: 'feed', h: 2.5 },
          ],
        },
        supportColumn(),
      ],
    ],
    desktopCaption: 'Desktop, Home tab',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [{ l: 'Home · Posts · Releases · Prod…', t: 'nav' }],
      [{ l: 'Pinned · latest release', t: 'feed' }],
      [{ l: 'Products shelf ›', t: 'feed' }],
      [{ l: 'Poll', t: 'feed' }],
      [{ l: 'Latest posts', t: 'feed', h: 2.5 }],
    ],
    mobileCaption: 'Phone, shelves stack',
  },
  {
    id: 'chips',
    title: 'One feed, chips',
    after: 'Threads and Bluesky feed switches, Discord forum tags',
    carries:
      'There is one feed. Chips above it filter by kind: All, Posts, Releases, Polls, Discussions. Products, Rules and FAQ become widgets beside the feed with See all, and a page opened from a widget slides over the feed with a back button.',
    strengths:
      'The most one-page of all. The feed dominates, the chips are the filter people look for first on any list, and on a phone the chip row is native.',
    costs:
      'Chips are for filtering one list, not for moving between areas, and past six or eight kinds the toolbar stops scaling. Releases lose their log shape (months, kinds) unless the chip swaps the whole body, and a page opened from a widget is a modal in disguise. Products can never be a chip.',
    evidence: (
      <>
        <Cite k="baymardFilters" short="Baymard on promoted filters" /> (two or
        three chips, and the filter also stays in its regular place);{' '}
        <Cite k="baymardToolbar" short="Baymard on horizontal toolbars" />;{' '}
        <Cite k="atlassianTabs" short="Atlassian tabs" /> (tabs group views of
        one thing, not areas).
      </>
    ),
    bestWhen:
      'The squad is mostly posts of different kinds and has no Products or documents worth a page.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        { l: 'All', s: 1, t: 'nav' },
        { l: 'Posts', s: 2, t: 'nav' },
        { l: 'Releases', s: 2, t: 'nav' },
        { l: 'Polls', s: 2, t: 'nav' },
        { l: 'Discussions', s: 2, t: 'nav' },
        { l: 'Latest ▾', s: 3, t: 'chrome' },
      ],
      [
        feed(),
        {
          l: '',
          s: 4,
          stack: [
            { l: 'Products, See all 6', t: 'info' },
            { l: 'Rules · FAQ', t: 'info' },
            { l: 'Team 8', t: 'info' },
            { l: 'Links', t: 'info' },
          ],
        },
      ],
    ],
    desktopCaption: 'Desktop, All',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [{ l: 'All · Posts · Releases · Polls ·…', t: 'nav' }],
      [feed(5, 12)],
      [{ l: 'Products · Rules · Team · Links', t: 'info' }],
    ],
    mobileCaption: 'Phone, chips scroll',
  },
  {
    id: 'about',
    title: 'About tab',
    after:
      'Twitch About panels, LinkedIn Page About, Reddit About on mobile, Skool and Whop About tabs',
    carries:
      'Everything that is not a stream of posts gets one tab: About. It holds the description, company facts, links, Rules and FAQ as accordions, the team with roles, and a followers preview with See all. Posts, Releases, Products, Discussions and Polls keep their tabs. The right column disappears entirely.',
    strengths:
      'One labelled place for company information, which is what people expect on any organization page. Accordions suit many short independent sections and suit phones. No right rail to be blind to. It is exactly what Reddit, Skool and Whop show on a phone anyway.',
    costs:
      'Rules are one click away from the composer instead of beside it. Reddit is the cautionary tale: when rules are not at the point of posting, people do not read them, and Reddit shipped a pre-post rules check to compensate. So the composer must carry a one-line rules link of its own.',
    evidence: (
      <>
        <Cite k="nngAccordions" short="NN/g accordions" />;{' '}
        <Cite k="twitchPanels" short="Twitch info panels" />;{' '}
        <Cite k="redditWidgets" short="Reddit sidebar on mobile" />;{' '}
        <Cite k="redditPostCheck" short="Reddit Post Check" />;{' '}
        <Cite k="skoolTabs" short="Skool tabs" />;{' '}
        <Cite k="whopApp" short="Whop tabbed company page" />.
      </>
    ),
    bestWhen:
      'Mobile parity matters more than a full desktop right column, or as the phone fallback of any variant that has one.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        { l: 'Posts', s: 2, t: 'nav' },
        { l: 'Releases', s: 2, t: 'nav' },
        { l: 'Products', s: 2, t: 'nav' },
        { l: 'Discussions', s: 2, t: 'nav' },
        { l: 'Polls', s: 2, t: 'nav' },
        { l: 'About', s: 2, t: 'nav' },
      ],
      [
        {
          l: '',
          s: 12,
          stack: [
            { l: 'Description · company facts · links row', t: 'info' },
            { l: 'Rules ▸ (accordion, expand all)', t: 'info' },
            { l: 'FAQ ▸', t: 'info' },
            { l: 'Team 8 with roles', t: 'info' },
            { l: 'Followers 6,120 · See all', t: 'info' },
          ],
        },
      ],
    ],
    desktopCaption: 'Desktop, About tab',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [{ l: 'Posts · Releases · Products · … About', t: 'nav' }],
      [{ l: 'Description · links', t: 'info' }],
      [{ l: 'Rules ▸', t: 'info' }],
      [{ l: 'FAQ ▸', t: 'info' }],
      [{ l: 'Team · Followers', t: 'info' }],
    ],
    mobileCaption: 'Phone, About tab',
  },
  {
    id: 'rail',
    title: 'Right rail cards',
    after:
      'Reddit community sidebar, Skool About card, GitHub org Overview column',
    carries:
      'The center is posts and nothing else. The right column carries a Pages card (Releases 14, Products, Discussions, Polls), an About card with description, counts and Follow, Rules as an accordion, Team, and Links. A page opens in the center with a back button. On a phone the column becomes an About tab.',
    strengths:
      'The cleanest center. The column repeats on every page so orientation never changes. Skool puts the join button in this card and Reddit its description, rules and moderators.',
    costs:
      'People have trained themselves to skip the right column: in one eyetracking case it took 0.8% of fixations for a quarter of the screen. Anything required, the navigation included, cannot live only there. This is the pages column with a different address, and it is the variant Reddit users could not find rules in on mobile.',
    evidence: (
      <>
        <Cite k="nngRail" short="NN/g right-rail blindness" />;{' '}
        <Cite k="redditLoggedOut" short="Reddit logged-out redesign" /> (sticky,
        independently scrolling sidebar);{' '}
        <Cite k="redditWidgets" short="Reddit widgets on mobile" />;{' '}
        <Cite k="primerPatterns" short="Primer" /> (sidebars become an index
        page or a sheet at narrow widths).
      </>
    ),
    bestWhen:
      'Desktop is the only surface that matters and the feed must be untouched by chrome.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        feed(8),
        {
          l: '',
          s: 4,
          stack: [
            {
              l: 'Pages: Releases 14 · Products · Discussions · Polls',
              t: 'nav',
              h: 2,
            },
            { l: 'About · 6.1k followers · Follow', t: 'info' },
            { l: 'Rules ▸', t: 'info' },
            { l: 'Team 8', t: 'info' },
            { l: 'Links', t: 'info' },
          ],
        },
      ],
    ],
    desktopCaption: 'Desktop, no row at all',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [
        { l: 'Posts', s: 6, t: 'nav' },
        { l: 'About', s: 6, t: 'nav' },
      ],
      [feed(5, 12)],
    ],
    mobileCaption: 'Phone, column becomes About',
  },
  {
    id: 'anchors',
    title: 'One page, anchors',
    after:
      'Crunchbase and Wellfound section navigation, Kickstarter tab row, Slack app page anchors',
    carries:
      'Everything on one long page in sections: latest posts, releases, products, the poll, rules, FAQ, team. A sticky "On this page" row (or a right-hand table of contents) scroll-spies the sections. Each list section shows five with Show more and its count. No routed sub-pages.',
    strengths:
      'The whole company is one scroll and one URL, the way a company profile on Crunchbase or Wellfound reads. In-page links were used and liked by 9 of 11 participants when they had a specific need, and the table of contents gives a mental model of the page.',
    costs:
      'Anchors are for pages of independent chunkable sections, not for a feed: an infinite feed cannot sit above anything. Long pages cost on phones. People ignore in-page links during first exploration, and Discussions or Polls as a section of five is a preview, not the page.',
    evidence: (
      <>
        <Cite k="nngInPage" short="NN/g in-page links" />;{' '}
        <Cite k="nngInfinite" short="NN/g infinite scrolling" /> (nothing
        required below an infinite list);{' '}
        <Cite k="wellfound" short="Wellfound" /> (routed sections with prev and
        next).
      </>
    ),
    bestWhen:
      'The page is a profile more than a feed: a young squad, or a company whose releases and products matter more than discussion.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        {
          l: 'On this page: Posts · Releases 14 · Products 6 · Poll · Rules · FAQ · Team (sticky, scroll-spy)',
          t: 'nav',
        },
      ],
      [
        {
          l: '',
          s: 9,
          stack: [
            { l: 'Latest posts (5) · Show more', t: 'feed', h: 2 },
            { l: 'Releases (5 of 14) · Show more', t: 'feed', h: 2 },
            { l: 'Products (6)', t: 'feed' },
            { l: 'Poll', t: 'feed' },
            { l: 'Rules · FAQ · Team', t: 'info' },
          ],
        },
        { l: 'Table of contents (sticky)', s: 3, t: 'nav', h: 6 },
      ],
    ],
    desktopCaption: 'Desktop, one URL',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [{ l: 'Posts · Releases · Products · Poll ·…', t: 'nav' }],
      [{ l: 'Latest posts (5)', t: 'feed', h: 2 }],
      [{ l: 'Releases (5 of 14)', t: 'feed', h: 2 }],
      [{ l: 'Products · Poll · Rules…', t: 'feed', h: 2 }],
    ],
    mobileCaption: 'Phone, one long scroll',
  },
  {
    id: 'highlights',
    title: 'Highlights strip',
    after:
      'Instagram highlights, Whop apps row on mobile, Discord Server Guide resources',
    carries:
      'A strip of round buttons under the stats: every page and every link, one glyph and a short label each, external ones marked. The center is posts until a highlight is picked; the strip stays and marks the active one.',
    strengths:
      'The most visual and the most phone-native, since the strip scrolls. External links get equal billing with pages, which suits a company whose docs and GitHub matter as much as its posts.',
    costs:
      'A strip of twelve glyphs asks the visitor to read icons, and labels are short by force. Instagram just moved its own highlights ring into a tab, and its users predicted far less engagement for anything not on the ring. Pages and links mixed in one strip is the "never mix navigation kinds" rule broken on purpose.',
    evidence: (
      <>
        <Cite k="igHighlights" short="Instagram Highlights moved to a tab" />;{' '}
        <Cite k="nngScent" short="NN/g information scent" /> (labels, not icons,
        carry scent); <Cite k="discordGuide" short="Discord Server Guide" />{' '}
        (resources as clean pages off the channel list).
      </>
    ),
    bestWhen:
      'A mobile-first squad with few pages and many links, or as a links row only, under the bio.',
    desktop: [
      chrome,
      banner,
      identity(),
      [
        {
          l: '◯ Releases  ◯ Products  ◯ Discussions  ◯ Polls  ◯ Rules  ◯ FAQ  ◯ Docs ↗  ◯ GitHub ↗  ◯ Discord ↗  ◯ X ↗',
          t: 'nav',
          h: 2.25,
        },
      ],
      [
        feed(),
        {
          l: '',
          s: 4,
          stack: [
            { l: 'Official company page', t: 'info' },
            { l: 'Team 8', t: 'info' },
          ],
        },
      ],
    ],
    desktopCaption: 'Desktop, strip under the stats',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [{ l: '◯ ◯ ◯ ◯ ◯ ◯ ◯ →', t: 'nav', h: 2 }],
      [feed(5, 12)],
    ],
    mobileCaption: 'Phone, strip scrolls',
  },
  {
    id: 'sheet',
    title: 'Pages sheet',
    after: 'Discord mobile server drawer, Whop mobile, Primer bottom sheet',
    carries:
      'The sidebar becomes a sheet. A "Pages" button beside Follow opens it over the feed with every page, document, link and the Manage section, exactly as the column was. The page itself is header and feed, full width.',
    strengths:
      'Nothing is redesigned: the sidebar is kept and hidden. The feed gets the whole width. This is what every sidebar product does on a phone already.',
    costs:
      'Hidden navigation is the best-measured failure in this list: 27% usage against 48% for visible on desktop, tasks 39% slower, discoverability down more than a fifth, and people open it later in the session. It is the control the other nine are measured against, not a candidate.',
    evidence: (
      <>
        <Cite k="nngHamburger" short="NN/g hidden navigation study" />;{' '}
        <Cite k="discordMobile" short="Discord mobile redesign" /> (kept the
        server column because people belong to many servers, and still drew
        backlash); <Cite k="nngSubnav" short="NN/g mobile subnavigation" />{' '}
        (drill-in menus disorient and collide with Back).
      </>
    ),
    bestWhen: 'Never on desktop. On a phone, only for the Manage section.',
    desktop: [
      chrome,
      banner,
      [
        { l: 'Avatar · CodeRabbit ✓ · meta', s: 6, t: 'chrome', h: 2.25 },
        { l: '☰ Pages', s: 2, t: 'nav', h: 2.25 },
        { l: 'Follow', s: 2, t: 'cta', h: 2.25 },
        { l: 'Bell · ⋯', s: 2, t: 'chrome', h: 2.25 },
      ],
      [
        {
          l: 'Sheet: Home · Releases · Products · Discussions · Polls · Rules · FAQ · Links · Manage',
          s: 4,
          t: 'nav',
          h: 7,
        },
        { l: 'Posts feed (dimmed)', s: 8, t: 'muted', h: 7 },
      ],
    ],
    desktopCaption: 'Desktop, sheet open',
    mobile: [
      chrome,
      ...mobileIdentity(),
      [feed(3, 12)],
      [{ l: 'Bottom sheet: pages…', t: 'nav', h: 3 }],
    ],
    mobileCaption: 'Phone, bottom sheet',
  },
];

/* --------------------------------------------------------------- tables */

const principles: { title: string; body: ReactNode }[] = [
  {
    title: 'Visible beats hidden, and combo equals visible.',
    body: (
      <>
        In NN/g&apos;s study of 179 people on six live sites, hidden navigation
        was used in 27% of desktop tasks against 48% for visible, with tasks 39%
        slower and content discoverability down more than 20%. A row that shows
        what fits and folds the rest into a labelled overflow scored the same as
        fully visible. <Cite k="nngHamburger" />
      </>
    ),
  },
  {
    title:
      'Horizontal local navigation under the header, subordinate to daily.dev.',
    body: (
      <>
        A company page is a subsite. Its areas are local navigation and the
        documented alternative to the inverted-L sidebar is a row directly under
        the page header, styled below the global chrome and above parent
        categories. The sidebar&apos;s cost is content-to-chrome: NN/g&apos;s
        example goes from 5:1 with a column to 12:1 without.{' '}
        <Cite k="nngLocal" />, <Cite k="nngUniversal" />,{' '}
        <Cite k="nngVertical" />
      </>
    ),
  },
  {
    title: 'Areas are routed pages styled as tabs, not in-page tabs.',
    body: (
      <>
        One URL per area, one preselected, counts allowed as enhancement,
        overflow into a menu when the row does not fit, at most two levels,
        never a second stacked row. Shareable URLs also matter because AI
        crawlers read raw HTML only. <Cite k="primerNav" />,{' '}
        <Cite k="govukSecondary" />
      </>
    ),
  },
  {
    title: 'Five or six visible, the rest behind a word.',
    body: (
      <>
        Carbon caps tabs at six, Apple at three to five on a phone, and Baymard
        found horizontal toolbars stop scaling past six to eight kinds with the
        More button overlooked by some. Priority+ is the responsive rule that
        keeps the row honest at every width. <Cite k="carbonTabs" />,{' '}
        <Cite k="higTabs" />, <Cite k="baymardToolbar" />,{' '}
        <Cite k="priorityPlus" />
      </>
    ),
  },
  {
    title: 'Everything common to all areas sits above the row.',
    body: (
      <>
        Identity, seal, meta strip, description, counts, Follow, bell, share and
        links are utility and identity, not areas, so they live in the header.
        One primary action; the rest secondary and rolled into one menu on small
        screens. <Cite k="atlassianTabs" />, <Cite k="nngUtility" />,{' '}
        <Cite k="polarisPage" />, <Cite k="primerHeader" />
      </>
    ),
  },
  {
    title: 'The landing view is hybrid: content first, doors above it.',
    body: (
      <>
        A page that is only links to other pages adds a step and annoys. Product
        Hunt&apos;s hub redesign drew &quot;this page is a dead-end&quot; and
        &quot;information hierarchy feels too flat&quot;. Render the default
        area immediately under the row. A bento of eight doors is eight
        promo-looking boxes with low scent. <Cite k="nngCategory" />,{' '}
        <Cite k="phRedesign" />, <Cite k="bento" />
      </>
    ),
  },
  {
    title: 'Two levels of disclosure, and Manage is its own control.',
    body: (
      <>
        Areas are level one, the Manage sub-areas level two; nothing deeper.
        GitHub appends Settings and Teams to the same row only for the people
        who may see them, which keeps management one click from the public page
        without mixing it into the visitor&apos;s tabs. Nobody surfaces a
        moderation queue on the public page. <Cite k="nngDisclosure" />,{' '}
        <Cite k="githubOrg" />, <Cite k="nngTabs" />
      </>
    ),
  },
  {
    title: 'Stick only what repeats, shrunk to a bar.',
    body: (
      <>
        Sticky headers raise use of what is in them at the price of viewport on
        every page. Collapse the hero into avatar, name, Follow and the row;
        keep it opaque and one line tall; on phones let it return on scroll-up.
        Never add a second sticky bar: pinned CTAs on listing pages won none of
        33 A/B tests. <Cite k="nngSticky" />, <Cite k="smashingSticky" />,{' '}
        <Cite k="stickyCta" />
      </>
    ),
  },
  {
    title:
      'The right column is support, never the only home of anything required.',
    body: (
      <>
        Right-rail blindness is measured: 0.8% of fixations for 25% of the
        screen in one case. Reddit&apos;s sidebar rules were invisible on phones
        for years, mods complained, and Reddit&apos;s 2025 answer was a pre-post
        rules check rather than hoping people read the column. Cards there must
        look like content and fold under the feed or into About when the width
        goes. <Cite k="nngRail" />, <Cite k="redditWidgets" />,{' '}
        <Cite k="redditPostCheck" />, <Cite k="primerPatterns" />
      </>
    ),
  },
  {
    title: 'Shelves are shortcuts with a literal See all and a count.',
    body: (
      <>
        Most people never see past the first card of a carousel, so a shelf can
        preview an area but never be the only route to it. Five visible, a
        clipped edge card, no autoplay, and &quot;See all releases&quot; as a
        link rather than a tappable heading. <Cite k="baymardCarousel" />,{' '}
        <Cite k="baymardViewAll" />, <Cite k="nngCarousel" />
      </>
    ),
  },
  {
    title: 'Infinite scroll for the feed only; nothing required below it.',
    body: (
      <>
        Releases, followers and the moderation queue use Show more with counts
        and restore position on Back. Rules and FAQ cannot depend on reaching
        the end of a feed, which is the argument against stacking them under
        posts on a phone. <Cite k="nngInfinite" />
      </>
    ),
  },
  {
    title: 'Labels are nouns with scent, plus counts.',
    body: (
      <>
        Releases, Products, Discussions, Polls, Rules, FAQ, Followers. Not
        Explore, Community or More from CodeRabbit. Counts on activity tabs
        (Kickstarter&apos;s FAQ 19, Updates 45) tell people what is behind the
        label before they click. <Cite k="nngScent" />, <Cite k="ksRewards" />
      </>
    ),
  },
  {
    title: 'On a phone: a scrolling row with a clipped last tab, then About.',
    body: (
      <>
        Do not fold the row into a menu (hidden nav costs 15% time and about 30
        points of usage on mobile). Offset the first tab and let the last one be
        visibly cut so the row reads as scrollable. Four or five areas reachable
        without scrolling the row. Accordions over anchors for rules and FAQ.
        Admin sub-areas as a section menu, not drill-in sheets.{' '}
        <Cite k="m2Tabs" />, <Cite k="baymardInline" />, <Cite k="nngSubnav" />
      </>
    ),
  },
  {
    title: 'The trust token lives on the name line and is echoed on people.',
    body: (
      <>
        GitHub and Hugging Face write Verified beside the name; X gives
        affiliates a small square of the parent logo and the org an Affiliates
        tab; Stack Overflow marks recognized members and recommended answers;
        Bluesky lets a tap on the check show who granted it. A word or a mark,
        never a banner or a section. <Cite k="githubVerified" />,{' '}
        <Cite k="xOrgs" />, <Cite k="soCollectives" />, <Cite k="bskyVerify" />
      </>
    ),
  },
];

const fieldNotes: ReactNode[][] = [
  [
    'X',
    'Six or seven sticky scrolling text tabs; orgs get an Affiliates tab; the 2026 redesign turns them into icon segments',
    'Header only: meta line, link, joined date, pinned post first in Posts',
    'Follow, bell, More (share, lists, mute, report)',
    'Edit profile swaps into the Follow slot; org tools in the global nav',
    'Same, icon tabs',
  ],
  [
    'YouTube',
    'Sticky tabs shown only when the channel has that content; Home is up to twelve owner-ordered shelves',
    'About dialog from "…more": description, up to 14 links, stats',
    'Subscribe, bell after subscribing, Join',
    'Customize channel and Manage videos replace Subscribe, open Studio',
    'Compressed header, sticky scrolling tabs',
  ],
  [
    'Reddit',
    'Feed and Wiki tabs plus sort chips; a highlights carousel of up to six pinned posts',
    'Right column: description, Rules accordion, Bookmarks, Moderators; on a phone "See more" opens an About screen',
    'Join, Create post, bell, More',
    'Mod Tools button top right, a separate hub',
    'Column collapses into About; rules went unread, so Post Check was added',
  ],
  [
    'LinkedIn Page',
    'Five to eight tabs; Home is a snapshot of the others; Jobs and Life only when they exist',
    'About tab with structured sections',
    'Follow, a custom button, More',
    'Separate admin view with its own left nav and "View as member"',
    'Chip row, compressed header',
  ],
  [
    'Instagram',
    'Icon tabs; Highlights moved from a ring under the bio into a tab in 2025',
    'Header: category label, bio, five links',
    'Follow, Message, Contact',
    'A full-width Professional dashboard row under the bio',
    'Canonical',
  ],
  [
    'Bluesky',
    'Eight scrolling tabs; feeds, lists and starter packs are tabs, not cards',
    'Bio only',
    'Follow, More',
    'Edit profile in the Follow slot',
    'Same',
  ],
  [
    'GitHub org',
    'Underline tabs with counts; Teams appended for members, Settings for owners',
    'README and pinned repos in the main column; People, Languages, Topics cards on the right of Overview only',
    'Follow, Sponsor',
    'Settings tab; pin and README in place; Public / Member view toggle',
    'Tabs scroll or overflow; cards stack under the README',
  ],
  [
    'Hugging Face org',
    'Tabs with counts (Collections 15, models 70)',
    'Team members as an avatar row with +270 under the header; org card in the main column; no sidebar',
    'Follow',
    'Edit-card button for members; settings on its own route',
    'Already one column',
  ],
  [
    'Product Hunt',
    'Tabs with counts and a More overflow; Overview is shelves',
    'Right cards on Overview only (awards, similar products, company info)',
    'Follow, upvote, Visit website',
    'Separate launch dashboard',
    'Cards stack; users called the hub "a dead-end" and "too flat"',
  ],
  [
    'Kickstarter',
    'Tab row with counts: FAQ 19, Updates 45, Comments 127k; Rewards tab added so backers stop jumping around',
    'Creator card in the right column; FAQ is a tab; risks at the bottom',
    'Back this project, Remind me, Share',
    'Separate creator dashboard',
    'Rewards column drops under the story',
  ],
  [
    'Skool',
    'Six or seven fixed tabs the owner can hide; category pills filter the feed',
    'Right About card on every tab: description, links, members and online counts, join button',
    'JOIN GROUP inside the About card',
    'SETTINGS button in the header',
    'Same tabs; the card becomes the About tab',
  ],
  [
    'Patreon',
    'Home (curated shelves) and Posts (chronological) plus owner-added links; other sections in a top-right menu',
    'Expandable About in the header, More menu',
    '"Join for free" directly under the header, paid options below',
    'Edit page top right, a side panel with Public / Free / Paid preview',
    'Same page on mobile web',
  ],
  [
    'Whop (mobile)',
    'Home, Apps, Products, About tabs after the 2025 rebuild',
    'About tab holds the team; FAQ and benefits as storefront sections',
    'Owner-labelled Join or Subscribe',
    'Separate business dashboard; owners see the same tabs with owner tools',
    'Five-tab app bar under a tabbed page',
  ],
  [
    'Twitch',
    'Home, About, Schedule, Videos; Home is shelves',
    'About tab is info panels (rules, socials, specs) plus a social row',
    'Follow with bell, Subscribe',
    'Creator dashboard; panels edited in place with an Edit Panels toggle',
    'Tabs under the player; panels read-only',
  ],
  [
    'Steam hub',
    'Ten tabs; All is a mixed front page with official announcements pinned',
    'Right column: info, rules, moderators',
    'Follow',
    'Admin panel; developer label on posts',
    'Tabs wrap',
  ],
  [
    'dev.to org',
    'No tabs; one feed',
    'Cards beside the feed: Meet the team, posts and members counts, tech stack',
    'Follow; admins also see Settings and Admin links in the header',
    'Settings route with analytics',
    'Cards stack above the feed',
  ],
];

const seatItems: Record<string, string[]> = {
  'Home / posts': [
    'Posts tab',
    'Posts tab',
    'Posts tab',
    'Posts tab, Home is shelves',
    'All chip',
    'Posts tab',
    'The center',
    'First section',
    'The center',
    'The center',
  ],
  Releases: [
    'Tab',
    'Tab, count',
    'Tab',
    'Tab and shelf',
    'Chip',
    'Tab',
    'Pages card',
    'Section, anchor',
    'Glyph',
    'Sheet',
  ],
  Products: [
    'Tab',
    'Tab',
    'Tab',
    'Tab and shelf',
    'Widget, See all',
    'Tab',
    'Pages card',
    'Section',
    'Glyph',
    'Sheet',
  ],
  'Discussions, Polls': [
    'Tabs',
    'Tabs, count',
    'Tabs',
    'Tabs, poll shelf',
    'Chips',
    'Tabs',
    'Pages card',
    'Sections (5)',
    'Glyphs',
    'Sheet',
  ],
  'Rules, FAQ': [
    'Card by the feed',
    'About tab, card on Posts',
    'Card by the feed',
    'Card by the feed',
    'Widget',
    'About accordions',
    'Rail accordion',
    'Sections',
    'Glyphs',
    'Sheet',
  ],
  Links: [
    'Card',
    'Header link row',
    'Header link row',
    'Card',
    'Widget',
    'About, header row',
    'Rail card',
    'Header row',
    'Glyphs, marked',
    'Sheet',
  ],
  Followers: [
    'Count',
    'More, count on tab',
    'Count',
    'Count',
    'Count',
    'About preview',
    'About card',
    'Team section',
    'Count',
    'Sheet',
  ],
  Follow: [
    'Header',
    'Header',
    'Header, then the bar',
    'Header',
    'Header',
    'Header',
    'Header and rail card',
    'Header',
    'Header',
    'Header',
  ],
  Manage: [
    'Header menu',
    'Appended tab',
    'Header menu',
    'Header menu',
    'Header menu',
    'Header menu',
    'Rail card',
    'Header menu',
    'Glyph',
    'In the sheet',
  ],
};

const scoreRows: Record<string, string[]> = {
  'Visible at first paint': [
    '5 areas',
    '6 areas, More',
    'As the base',
    '6 areas',
    '4 chips',
    '6 areas',
    '4 in a card',
    '7 anchors',
    '8 to 10 glyphs',
    '1 button',
  ],
  'Feed first on Home': [
    'Yes',
    'Yes',
    'Yes',
    'No, one tab away',
    'Yes',
    'Yes',
    'Yes',
    'Yes, then sections',
    'Yes',
    'Yes',
  ],
  'Rules from the composer': [
    'Beside it',
    'Beside it on Posts',
    'Beside it',
    'Beside it',
    'Beside it',
    'One click',
    'Rail, often unseen',
    'Same page',
    'One click',
    'Two clicks',
  ],
  'Grows to': [
    '6 tabs',
    'Unlimited via More',
    'As the base',
    'Unlimited shelves',
    '5 chips',
    '6 tabs and About',
    'Unlimited rows',
    '8 anchors',
    '8 glyphs',
    'Unlimited',
  ],
  Mobile: [
    'Row scrolls; cards sink',
    'Row scrolls, More; About',
    'Bar returns on scroll-up',
    'Shelves stack',
    'Chips scroll',
    'About tab',
    'Becomes About',
    'Long page',
    'Strip scrolls',
    'Bottom sheet',
  ],
  'Strongest evidence': [
    'NN/g tabs; X, GitHub',
    'NN/g combo nav; Primer; Kickstarter',
    'Smashing 22% faster; NN/g sticky',
    'Patreon, YouTube',
    'Baymard promoted filters',
    'NN/g accordions; Twitch, Skool',
    'Reddit, Skool',
    'NN/g in-page links; Crunchbase',
    'Instagram, Whop',
    'Discord mobile',
  ],
  'Evidence against': [
    'Overflows at 7',
    'More is overlooked by some',
    'Viewport cost per page',
    'Feed one click away; carousel blindness',
    'Chips are filters, not areas',
    'Rules a click from the composer',
    'Right-rail blindness 0.8%',
    'Nothing lives below a feed',
    'Icons carry no scent; IG moved its ring',
    'Hidden nav 27% vs 48%',
  ],
  Verdict: [
    'Base',
    'Spine',
    'Add to the spine',
    'One shelf, not a tab',
    'Sort, not nav',
    'The phone fallback',
    'Cards on Posts only',
    'For the About tab',
    'A links row only',
    'Manage on phones only',
  ],
};

const manageOptions: ReactNode[][] = [
  [
    'Appended tab',
    'Manage 3 at the end of the row, visible to staff only; inside it a second-level row: Moderation 3, Content feed, Analytics, Settings. Moderators see Moderation alone.',
    'GitHub Settings and Teams tabs, npm Settings and Billing',
    'One click from the public page, badge carries the queue, no new surface. Must read as a different kind of tab.',
  ],
  [
    'Header pill and panel',
    'A Manage pill beside Edit page opens a side panel with the same four sections and a Preview as Public / Follower / Moderator switch.',
    'Patreon Edit page panel, GitHub view-as toggle',
    'Keeps the row clean and gives preview for free. A panel over a page is a modal in disguise for anything long, like the queue.',
  ],
  [
    'Separate dashboard',
    'Manage opens a full admin surface with its own left nav, the way production has squad settings and moderation as pages today.',
    'LinkedIn admin view, YouTube Studio, Reddit Mod Tools',
    'Right for heavy work, but it brings the sidebar back for the people who use the page most and loses the "same page, more tools" feel.',
  ],
  [
    'In place',
    'Edit page on the header, pencil affordances on the about block, pins and shelves, a Feed settings strip on Releases for admins.',
    'Wellfound Edit Profile, G2 pencils, Hugging Face edit card, Twitch Edit Panels',
    'Not a home for the queue or analytics on its own. Pairs with the appended tab.',
  ],
];

/* ---------------------------------------------------------------- views */

const Legend = (): ReactElement => (
  <div className="flex flex-wrap gap-2">
    {(Object.keys(tones) as Tone[]).map((tone) => (
      <span
        key={tone}
        className={classNames('rounded-8 px-2 py-1 typo-caption2', tones[tone])}
      >
        {toneLabel[tone]}
      </span>
    ))}
  </div>
);

const VariationBlock = ({
  spec,
  index,
}: {
  spec: Variation;
  index: number;
}): ReactElement => (
  <div className="flex flex-col gap-5 border-t border-border-subtlest-tertiary pt-10">
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-3">
        <span className="sq-nums font-bold text-text-quaternary typo-title3">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-bold typo-title2">{spec.title}</h3>
        <span className="text-text-quaternary typo-footnote">
          after {spec.after}
        </span>
      </div>
      <p className="max-w-[100ch] text-text-secondary typo-callout">
        {spec.carries}
      </p>
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_10rem] items-start gap-6">
      <Frame rows={spec.desktop} caption={spec.desktopCaption} />
      <Frame rows={spec.mobile} caption={spec.mobileCaption} />
    </div>
    <div className="grid max-w-[110ch] grid-cols-2 gap-x-8 gap-y-3 text-text-tertiary typo-footnote">
      <p>
        <b className="text-text-secondary">Strengths. </b>
        {spec.strengths}
      </p>
      <p>
        <b className="text-text-secondary">Costs. </b>
        {spec.costs}
      </p>
      <p>
        <b className="text-text-secondary">Evidence. </b>
        {spec.evidence}
      </p>
      <p>
        <b className="text-text-secondary">Best when. </b>
        {spec.bestWhen}
      </p>
    </div>
  </div>
);

const Spec = ({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex gap-4">
    <span className="sq-nums w-8 shrink-0 font-bold text-text-quaternary typo-callout">
      {n}
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <h4 className="font-bold text-text-primary typo-callout">{title}</h4>
      <div className="flex flex-col gap-2 text-text-secondary typo-footnote">
        {children}
      </div>
    </div>
  </div>
);

export const Overview: StoryObj = {
  render: () => (
    <Page>
      <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
        <Eyebrow>Squad page · No sidebar · Research</Eyebrow>
        <h1 className="max-w-[26ch] font-bold typo-mega3">
          Ten ways to seat the sidebar in the page, and the evidence for each
        </h1>
        <Prose>
          <p>
            The pages column carries eleven things: Home, Releases, Products,
            Discussions, Polls, Rules, FAQ, the company links, Followers,
            Follow, and the team&apos;s Manage section. Take the column away and
            every one of them needs a seat in the header, the row, the center,
            or the right column. This page collects what the usability
            literature says about that move, what thirty products do on a
            profile or organization page that never had a sidebar, ten ways to
            seat the load scored against that evidence, and the composite
            written out region by region at the end.
          </p>
          <p>
            Short version: the field and the research agree. One counted tab row
            under the identity block, everything common above it, the feed
            rendered immediately below it, the docs in an About tab with support
            cards beside the feed on desktop, a header that collapses into the
            row on scroll, and Manage appended to the row for the people who may
            see it.
          </p>
        </Prose>
      </header>

      <Section
        eyebrow="Evidence"
        title="Fourteen rules the literature gives us"
      >
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          {principles.map((rule, index) => (
            <div key={rule.title} className="flex min-w-0 gap-3">
              <span className="sq-nums shrink-0 font-bold text-text-quaternary typo-callout">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-bold text-text-primary typo-callout">
                  {rule.title}
                </span>
                <p className="text-text-tertiary typo-footnote">{rule.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Field notes"
        title="What sixteen products do without a sidebar"
      >
        <Prose>
          <p>
            Consumer profiles, community platforms and developer organization
            pages, read in September 2026. The full set covered thirty products;
            these are the ones that changed a decision. Three things recur
            everywhere: a counted tab row, the trust mark on the name line, and
            management entered from the header but done somewhere else.
          </p>
        </Prose>
        <Table
          minWidth="80rem"
          head={[
            'Product',
            'Navigation',
            'Info without a sidebar',
            'Actions',
            'Manage',
            'Phone',
          ]}
          rows={fieldNotes}
        />
      </Section>

      <Section eyebrow="Variations" title="Ten ways to seat the load">
        <Prose>
          <p>
            Each is drawn as a schematic at desktop and phone width, with the
            colour telling what kind of thing each block is. The first five live
            in the No sidebar story as working mock-ups; the rest are written
            here so the comparison is complete before more is built.
          </p>
        </Prose>
        <Legend />
        <div className="flex flex-col gap-6">
          {variations.map((spec, index) => (
            <VariationBlock key={spec.id} spec={spec} index={index} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Compare" title="Where each sidebar item lands">
        <Table
          minWidth="90rem"
          head={['', ...variations.map((spec) => spec.title)]}
          rows={Object.entries(seatItems).map(([item, cells]) => [
            item,
            ...cells,
          ])}
        />
      </Section>

      <Section eyebrow="Compare" title="Scored against the evidence">
        <Table
          minWidth="90rem"
          head={['', ...variations.map((spec) => spec.title)]}
          rows={Object.entries(scoreRows).map(([item, cells]) => [
            item,
            ...cells,
          ])}
        />
      </Section>

      <Section eyebrow="Manage" title="Where the team's section goes">
        <Prose>
          <p>
            The sidebar&apos;s Manage section is the part with no consumer
            precedent: no product surfaces a moderation queue on the public
            page. Four ways to seat it, with the products that do each.
          </p>
        </Prose>
        <Table
          minWidth="70rem"
          head={['Option', 'What it is', 'After', 'Trade']}
          rows={manageOptions}
        />
        <Prose>
          <p>
            Pick the appended tab, paired with in-place affordances. The queue
            badge on the tab does the job the sidebar badge did, moderators get
            one tab with one section, and a separate dashboard stays available
            later for analytics if it outgrows a page.
          </p>
        </Prose>
      </Section>

      <Section eyebrow="Verdict" title="The composite">
        <Prose>
          <p>
            No single variation wins on its own. The counted row is the spine
            because it is the only one that scales, keeps everything visible
            that can be, and has a documented equal to visible navigation. The
            condensing header gives back the one thing the column did that a
            header cannot. The About tab is the phone answer to the right column
            and the natural home of Rules, FAQ and the team, while the desktop
            keeps support cards beside the feed on Posts. The curated Home
            survives as one pinned shelf at the top of Posts rather than a
            second Home. Chips survive as the sort of one list. The highlights
            strip survives as the header&apos;s link row. The sheet survives
            only for Manage on a phone.
          </p>
        </Prose>
        <div className="grid grid-cols-[minmax(0,1fr)_10rem] items-start gap-6">
          <Frame
            caption="Desktop, Posts, admin view"
            rows={[
              chrome,
              banner,
              identity('Following'),
              [
                {
                  l: 'Docs ↗ · GitHub ↗ · X ↗ · YouTube ↗ · LinkedIn ↗ · and 1 more   ·   Team ●●●●●●●● 8',
                  t: 'chrome',
                },
              ],
              [
                { l: 'Posts', s: 1, t: 'nav' },
                { l: 'Releases 14', s: 2, t: 'nav' },
                { l: 'Products', s: 2, t: 'nav' },
                { l: 'Discussions 38', s: 2, t: 'nav' },
                { l: 'Polls 1', s: 1, t: 'nav' },
                { l: 'About', s: 1, t: 'nav' },
                { l: 'More ▾', s: 1, t: 'nav' },
                { l: 'Manage 3', s: 2, t: 'manage' },
              ],
              [
                {
                  l: '',
                  s: 8,
                  stack: [
                    {
                      l: 'Pinned: CodeRabbit Triage · v2.4 release',
                      t: 'feed',
                    },
                    { l: 'Composer · Posts are reviewed · Rules ↗', t: 'feed' },
                    { l: 'Latest | Top', t: 'chrome', h: 1.25 },
                    { l: 'Posts feed', t: 'feed', h: 4 },
                  ],
                },
                supportColumn(),
              ],
            ]}
          />
          <Frame
            caption="Phone, scrolled"
            rows={[
              chrome,
              [
                { l: 'CodeRabbit ✓', s: 7, t: 'chrome' },
                { l: 'Following', s: 5, t: 'cta' },
              ],
              [
                { l: 'Posts · Releases 14 · Prod…', s: 9, t: 'nav' },
                { l: 'More', s: 3, t: 'nav' },
              ],
              [{ l: 'Pinned', t: 'feed' }],
              [{ l: 'Composer · Rules ↗', t: 'feed' }],
              [feed(4, 12)],
            ]}
          />
        </div>
      </Section>

      <Section eyebrow="Written" title="The composite, region by region">
        <div className="grid max-w-[110ch] grid-cols-1 gap-8">
          <Spec n="01" title="Header at rest">
            <p>
              Banner (the X asset, 1500 by 500, anchored top), avatar
              overlapping its bottom edge, name with the seal, then one meta
              strip: coderabbit.ai · Developer tools · San Francisco, CA · Since
              Apr 2023. The bio on one line with &quot;more&quot;. A stats row:
              Followers 6,120 · Posts 184 · Upvotes 12.3k, each a link. Under it
              a link row of labelled icons, Docs, GitHub, X, YouTube, LinkedIn,
              and &quot;and 1 more&quot; past five, then the team as an avatar
              row of eight that opens Followers on the Moderators tab. Featured
              and Private chips only when true.
            </p>
            <p>
              Right cluster, one primary and the rest secondary: Follow (white)
              or Following, the bell once following, Share, More with the
              production items. Admins see Edit page and Boost before them.
              Anonymous sees Sign up to follow and no bell. Blocked sees Follow
              disabled and the strip below the row.
            </p>
          </Spec>
          <Spec n="02" title="The row">
            <p>
              Posts · Releases 14 · Products · Discussions 38 · Polls 1 · About,
              underline style, left-aligned, spanning the content width,
              directly above what it controls. Followers is the first item in
              More; Priority+ measures the width and moves the rightmost tabs
              into More one at a time. Counts load together so the row never
              shifts. Every tab is a routed URL, /squads/coderabbit/releases, so
              links and crawlers get real pages. Staff see Manage 3 appended at
              the far right, styled as the team&apos;s tab: dashed underline,
              badge for the queue.
            </p>
          </Spec>
          <Spec n="03" title="Posts, the default">
            <p>
              A pinned strip first (up to three, the team labels and expires
              them, the way Reddit highlights work), then the composer or the
              lock card with its reason, a one-line review note and a Rules
              link, then a Latest | Top segmented control, then the infinite
              feed. Own pending posts show as the strip above the feed. On
              desktop the support column sits beside Posts only: Official
              company page, Rules (first three, See all in About), Team 8,
              Links. Every other tab is full width.
            </p>
          </Spec>
          <Spec n="04" title="Releases, Products, Discussions, Polls">
            <p>
              As the workspace pages, full width. Releases keeps its month
              groups and the All · Features · Fixes · Betas chips as the filter
              of that one list, with Show more and the count, and for admins the
              Content feed strip naming the RSS source. Discussions and Polls
              keep their composers under the posting rules.
            </p>
          </Spec>
          <Spec n="05" title="About">
            <p>
              Description in full, the company facts (website, size, location,
              founded), the link row again, Rules as an accordion with expand
              all, FAQ as an accordion, Team with roles, a Followers preview of
              twelve with See all 6,120. Everything the right column shows on
              desktop is here too, so nothing lives in the rail alone. Admins
              get a pencil on each block.
            </p>
          </Spec>
          <Spec n="06" title="Manage">
            <p>
              Inside the tab a second-level segmented row: Moderation 3 ·
              Content feed · Analytics · Settings. Moderators see Moderation
              only. A Preview as switch (Public / Follower / Moderator) sits at
              the right of that row. Nothing goes deeper than this level; a
              queue item opens as the post does.
            </p>
          </Spec>
          <Spec n="07" title="Scroll">
            <p>
              When the row reaches the top it sticks and the hero collapses into
              it: avatar 24px, name, seal, Follow or Following, the row, bell
              and More as icons. One line, opaque, 48px, animated at scroll
              speed. No other sticky element on the page.
            </p>
          </Spec>
          <Spec n="08" title="Phone">
            <p>
              The banner shortens, the identity stacks, Follow spans the width
              with More beside it. The row scrolls with the first tab offset and
              the last visibly cut; More sits at its end. The support column
              folds into About, and the Official company page card sits under
              the bio instead. The sticky bar hides on scroll-down and returns
              on scroll-up. Manage opens as a section menu of its four pages,
              not a drill-in.
            </p>
          </Spec>
          <Spec n="09" title="States, unchanged">
            <p>
              Private squads show the production wall on every tab and the
              invitation landing; blocked users see Follow disabled and the
              strip; a young page shows empty states in place of the pinned
              strip and feed, with connect-the-feed for admins; featured adds
              the chip; boost stays an admin header action. Vocabulary stays
              Follow, Following, Followers.
            </p>
          </Spec>
        </div>
      </Section>

      <Section eyebrow="Sources" title="Everything cited">
        <div className="grid grid-cols-2 gap-x-10 gap-y-1">
          {Object.entries(sources).map(([key, source]) => (
            <a
              key={key}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="truncate text-text-tertiary typo-footnote hover:text-text-link"
            >
              {source.label}
            </a>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
