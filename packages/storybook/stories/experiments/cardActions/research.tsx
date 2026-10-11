import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

/**
 * Research brief, 2026-10-08. Confidence: M = measured on the live site
 * (1440px window, mostly logged out), S = read in the product's open-source
 * code, D = the product's own docs or announcement, U = unverified (memory or
 * secondary source). Reddit, X, LinkedIn, Instagram and Feedly need a login or
 * block the browser, so their rows are D/U.
 */

type Confidence = 'M' | 'S' | 'D' | 'U';

interface Product {
  name: string;
  rest: string;
  hidden: string;
  counts: string;
  layout: string;
  conf: Confidence[];
}

const PRODUCTS: Product[] = [
  {
    name: 'Bluesky',
    rest: 'Reply, Repost, Like, Bookmark, Share, ⋯',
    hidden: 'Quote (inside Repost)',
    counts:
      'Inline; zero hidden; one decimal under 10K, none above, rounded down',
    layout:
      '3 equal columns left, personal actions right. 18px icon in a 28px button, tap area extended ~10px each side',
    conf: ['S'],
  },
  {
    name: 'Mastodon',
    rest: 'Reply, Boost, Favourite, Share, Bookmark, ⋯',
    hidden: 'Quote (inside Boost)',
    counts: 'Inline; same rounding as Bluesky',
    layout: 'Identical small ghost buttons',
    conf: ['S'],
  },
  {
    name: 'X',
    rest: 'Reply, Repost, Like, Views',
    hidden: '⋯ in the header',
    counts: 'Inline, 1.2K / 12K',
    layout:
      'Four social actions spread; Bookmark + Share right. Views joined the bar Dec 2022',
    conf: ['U', 'D'],
  },
  {
    name: 'LinkedIn',
    rest: 'Counts line, then labelled Like · Comment · Repost · Send',
    hidden: 'Save etc. in ⋯',
    counts: 'In their own line above the buttons, never inside',
    layout: 'Four full-width text buttons',
    conf: ['U', 'D'],
  },
  {
    name: 'Reddit',
    rest: 'Vote pill (up · score · down), Comments pill, Share',
    hidden: '⋯ top-right',
    counts: 'Score inside the vote pill',
    layout: 'Pills in a row',
    conf: ['U'],
  },
  {
    name: 'Instagram',
    rest: 'Heart, Comment, Send left; Bookmark right',
    hidden: '⋯ in the header',
    counts: '“N likes” on its own line; hideable',
    layout: '3 left, 1 right',
    conf: ['U', 'D'],
  },
  {
    name: 'Pinterest',
    rest: 'Image (and title)',
    hidden: 'Hover: Save, board picker, Share, ⋯',
    counts: 'None in the grid',
    layout: '236px columns, 14px gutter',
    conf: ['S', 'U'],
  },
  {
    name: 'Dribbble',
    rest: 'Stats line: author, ♥ count, views',
    hidden: 'Hover overlay: 34px round Save / Like',
    counts: 'Small stats line, 5.6k',
    layout: '297px cards, 36px gutters at every width',
    conf: ['M'],
  },
  {
    name: 'Behance',
    rest: 'Stats line: appreciations, views',
    hidden: 'Save fades in on hover',
    counts: 'Stats line',
    layout: '330px cards, 24px gutter',
    conf: ['M'],
  },
  {
    name: 'Product Hunt',
    rest: 'Two 52×52 boxes: comments, upvote',
    hidden: '—',
    counts: 'Stacked under the icon; upvotes hidden for the first 4 hours',
    layout: 'Right edge of the row',
    conf: ['M'],
  },
  {
    name: 'YouTube',
    rest: 'No action bar: title, channel, “640K views · 13h ago”',
    hidden: '⋮ (40×40) on hover; preview plays',
    counts: 'Text in the metadata line',
    layout: '347px tiles, 16px gutter, ~32px between rows',
    conf: ['M'],
  },
  {
    name: 'Medium',
    rest: 'Claps, responses (16px icons)',
    hidden: 'Bookmark, show less, ⋯ on the right',
    counts: 'Inline stats',
    layout: 'Stats left, personal actions right',
    conf: ['M', 'U'],
  },
  {
    name: 'dev.to',
    rest: 'Reaction stack + “11 reactions”, “N comments”',
    hidden: 'Save (logged in)',
    counts: 'Written out as words',
    layout: '36px text buttons, 24px icons; whole card clickable',
    conf: ['M'],
  },
  {
    name: 'Substack',
    rest: 'Like, Comment, Restack, Share',
    hidden: '—',
    counts: 'Inline; count in the accessible name',
    layout: '24px tall, 14px icons',
    conf: ['M'],
  },
  {
    name: 'Hacker News',
    rest: '“281 points by … | hide | 254 comments”',
    hidden: '—',
    counts: 'Plain 12px text',
    layout: '~10px vote arrow',
    conf: ['M'],
  },
];

interface Rule {
  rule: string;
  detail: string;
  href: string;
}

const RULES: Rule[] = [
  {
    rule: 'WCAG 2.5.8 (AA): 24×24px minimum',
    detail:
      'Today’s 24px buttons sit exactly on the line. Smaller is allowed only with 24px of clear spacing.',
    href: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html',
  },
  {
    rule: 'WCAG 2.5.5 (AAA): 44×44px',
    detail:
      'The enhanced target. Reachable through tap area, not only visual size.',
    href: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html',
  },
  {
    rule: 'Apple HIG: 44pt iOS, 28pt macOS default',
    detail:
      'Leave ~12pt around bordered controls, ~24pt around borderless ones.',
    href: 'https://developer.apple.com/design/human-interface-guidelines/accessibility',
  },
  {
    rule: 'Material / Android: 48×48dp touch targets',
    detail: 'Pointer targets may be smaller.',
    href: 'https://developer.android.com/guide/topics/ui/accessibility/apps',
  },
  {
    rule: 'Hover reveal: 0.3–0.5s in, ≥0.5s out',
    detail:
      'And never the only path: touch and keyboard have no hover — reveal on :focus-within too.',
    href: 'https://www.nngroup.com/articles/timing-exposing-content/',
  },
  {
    rule: '⋯ menus: 3+ infrequent items, never 1–2',
    detail:
      'Frequency decides placement both ways — X pulled Bookmark out of Share to lift saves.',
    href: 'https://www.nngroup.com/articles/contextual-menus-guidelines/',
  },
  {
    rule: 'Icons need labels',
    detail:
      'Few icons are universal. Put the count in the accessible name (“Like (280)”), as Bluesky and Substack do.',
    href: 'https://www.nngroup.com/articles/icon-usability/',
  },
  {
    rule: 'Gutters: 8dp = one collection, 32dp = separate items',
    detail:
      'Material’s grid guidance. Sites measured keep the gutter fixed across widths and change the column count.',
    href: 'https://m2.material.io/design/layout/responsive-layout-grid.html',
  },
  {
    rule: 'Counts: one decimal under 10, rounded down',
    detail:
      'Bluesky and Mastodon do exactly the rule proposed in round 1 (1.7K, 23K). Intl compact keeps 2 significant digits.',
    href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat',
  },
  {
    rule: 'Whole card clickable, actions above it',
    detail:
      'One stretched link makes the card a big target; buttons sit on top (daily.dev already does this).',
    href: 'https://www.nngroup.com/articles/cards-component/',
  },
];

const PATTERNS: { name: string; who: string; concept: string }[] = [
  {
    name: 'Social left, personal right',
    who: 'Bluesky, X, Instagram, Medium',
    concept: 'C.3',
  },
  { name: 'Vote pill', who: 'Reddit', concept: '' },
  {
    name: 'Quiet downvote',
    who: 'YouTube (private dislikes cut dislike attacks)',
    concept: '',
  },
  {
    name: 'Impressions as text, not a button',
    who: 'YouTube, Dribbble, Behance',
    concept: '',
  },
  {
    name: 'Copy link into ⋯ / Share',
    who: 'LinkedIn (Repost and Send under Share)',
    concept: '',
  },
  {
    name: 'Actions on hover, stats at rest',
    who: 'Pinterest, Dribbble, Behance, Feedly',
    concept: 'E.1, E.2',
  },
  {
    name: 'Small button, large tap area',
    who: 'Bluesky',
    concept: 'C.3, E.1, E.2',
  },
  {
    name: 'Equal columns, steady counts',
    who: 'Bluesky',
    concept: 'E.1, E.2',
  },
  { name: 'One hero action', who: 'Product Hunt', concept: '' },
  {
    name: 'Counts in a line of their own',
    who: 'LinkedIn, Instagram',
    concept: '',
  },
];

const RESULTS: { what: string; outcome: string; href: string }[] = [
  {
    what: 'X adds view counts to the action bar (Dec 2022)',
    outcome:
      'Reason given: ~90% of users only read. No engagement data published.',
    href: 'https://techcrunch.com/2022/12/22/twitter-now-shows-how-many-people-view-your-tweets',
  },
  {
    what: 'X moves Bookmark out of the Share menu',
    outcome: 'To drive saves — frequent actions earn a slot.',
    href: 'https://www.socialmediatoday.com/news/x-tests-bookmarks-button-in-stream-to-encourage-more-use/694843/',
  },
  {
    what: 'YouTube makes dislike counts private',
    outcome: 'Fewer dislike attacks; the button still works.',
    href: 'https://blog.youtube/news-and-events/update-to-youtube/',
  },
  {
    what: 'Instagram tests hiding like counts',
    outcome: 'Little effect on wellbeing, divided users; shipped as opt-in.',
    href: 'https://about.instagram.com/blog/announcements/giving-people-more-control',
  },
];

const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-4 mt-12 font-bold typo-title2">{children}</h2>
);

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-text-link underline decoration-1 underline-offset-2"
  >
    {children}
  </a>
);

const confLabel: Record<Confidence, string> = {
  M: 'measured',
  S: 'source code',
  D: 'docs',
  U: 'unverified',
};

export const ResearchPage = (): ReactElement => (
  <div className="min-h-screen bg-background-default px-8 py-10 text-text-primary">
    <h1 className="mb-2 font-bold typo-title1">Research</h1>
    <p className="mb-6 max-w-3xl text-pretty text-text-tertiary typo-callout">
      How 15 products organise actions on feed cards, what gutters they use, and
      the rules that matter. Measured on live sites where possible (1440px
      window, 2026-10-08), otherwise read from open-source code or the product’s
      own docs. Rows marked unverified come from secondary sources.
    </p>

    <div className="grid max-w-5xl gap-4 laptop:grid-cols-3">
      {[
        {
          t: 'None we checked shows six equal actions on a ~270px card',
          b: 'Among the products measured or read in source (rows marked measured / source code), cards that fit 4–6 actions use 28–34px buttons with 14–18px icons. The closest widths to ours (Dribbble 297px, Behance 330px) show quiet stats at rest and actions on hover.',
        },
        {
          t: 'Bigger targets don’t need bigger buttons',
          b: 'Bluesky keeps a 28px button and an 18px icon, then extends the tap area ~10px around it. The size you can hit and the size you see are separate decisions.',
        },
        {
          t: 'The number rule matches Bluesky and Mastodon',
          b: 'One decimal under 10K, none above, rounded down — read in both products’ source code. Zero counts hidden.',
        },
      ].map(({ t, b }) => (
        <div
          key={t}
          className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
        >
          <p className="mb-1 font-bold typo-callout">{t}</p>
          <p className="text-pretty text-text-tertiary typo-footnote">{b}</p>
        </div>
      ))}
    </div>

    <H2>How each product does it</H2>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[60rem] text-left typo-footnote">
        <thead className="text-text-tertiary">
          <tr className="border-b border-border-subtlest-tertiary">
            {[
              'Product',
              'At rest',
              'Hover / ⋯',
              'Counts',
              'Layout & sizes',
              'Source',
            ].map((h) => (
              <th key={h} className="py-2 pr-4 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PRODUCTS.map((p) => (
            <tr
              key={p.name}
              className="border-b border-border-subtlest-tertiary align-top"
            >
              <td className="py-2 pr-4 font-bold">{p.name}</td>
              <td className="py-2 pr-4 text-text-secondary">{p.rest}</td>
              <td className="py-2 pr-4 text-text-tertiary">{p.hidden}</td>
              <td className="py-2 pr-4 text-text-tertiary">{p.counts}</td>
              <td className="py-2 pr-4 text-text-tertiary">{p.layout}</td>
              <td
                className={classNames(
                  'py-2 pr-4',
                  p.conf.includes('M') || p.conf.includes('S')
                    ? 'text-accent-avocado-default'
                    : 'text-text-quaternary',
                )}
              >
                {p.conf.map((c) => confLabel[c]).join(' + ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <H2>Gutters between cards</H2>
    <div className="flex max-w-5xl flex-wrap items-end gap-6">
      {[
        { n: 'Pinterest', g: 14 },
        { n: 'YouTube', g: 16 },
        { n: 'Behance', g: 24 },
        { n: 'daily.dev today', g: 32 },
        { n: 'Dribbble', g: 36 },
      ].map(({ n, g }) => (
        <div key={n} className="flex flex-col items-center gap-2">
          <div className="flex items-end" style={{ gap: g }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                className={classNames(
                  'h-16 w-12 rounded-8',
                  n.startsWith('daily')
                    ? 'bg-accent-cabbage-default'
                    : 'bg-surface-float',
                )}
              />
            ))}
          </div>
          <p className="font-bold typo-footnote">{g}px</p>
          <p className="text-text-tertiary typo-caption1">{n}</p>
        </div>
      ))}
    </div>
    <p className="mt-4 max-w-3xl text-pretty text-text-tertiary typo-footnote">
      Material: an 8dp gutter makes cards read as one collection, 32dp as
      separate items. Every site measured keeps its gutter fixed across window
      widths and changes the column count instead — the same model daily.dev
      uses.
    </p>

    <H2>Patterns, and which shortlisted variant uses them</H2>
    <div className="grid max-w-5xl gap-2 laptop:grid-cols-2">
      {PATTERNS.map((p) => (
        <div
          key={p.name}
          className="flex items-baseline justify-between gap-4 rounded-12 border border-border-subtlest-tertiary px-4 py-2"
        >
          <div>
            <p className="font-bold typo-callout">{p.name}</p>
            <p className="text-text-tertiary typo-caption1">{p.who}</p>
          </div>
          {p.concept ? (
            <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold text-accent-cabbage-default typo-footnote">
              {p.concept}
            </span>
          ) : (
            <span className="shrink-0 text-text-quaternary typo-caption1">
              not shortlisted
            </span>
          )}
        </div>
      ))}
    </div>

    <H2>Rules with numbers</H2>
    <ul className="flex max-w-4xl flex-col gap-3">
      {RULES.map((r) => (
        <li key={r.rule} className="typo-callout">
          <Ext href={r.href}>{r.rule}</Ext>
          <span className="text-text-tertiary"> — {r.detail}</span>
        </li>
      ))}
    </ul>

    <H2>Published changes</H2>
    <ul className="flex max-w-4xl flex-col gap-3">
      {RESULTS.map((r) => (
        <li key={r.what} className="typo-callout">
          <Ext href={r.href}>{r.what}</Ext>
          <span className="text-text-tertiary"> — {r.outcome}</span>
        </li>
      ))}
    </ul>
    <p className="mt-4 max-w-3xl text-text-quaternary typo-footnote">
      No published A/B test with numbers on action-bar layout itself was found.
      Treat all of this as precedent, not proof.
    </p>
  </div>
);
