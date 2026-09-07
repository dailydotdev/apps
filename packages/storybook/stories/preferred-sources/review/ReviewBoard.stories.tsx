import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bullets,
  Heading,
  Muted,
  Page,
  PageHeader,
} from '../../open-graph/ogStoryLayout';
import { StoryFrame, openHref } from './_review';
import type { Viewport } from './_review';

type Item = {
  n: number;
  id: string;
  name: string;
  appears: string;
  goesAway: string;
  label: string;
  /** What is being approved — the exact decision. */
  approve: string;
  variants: Array<{ key: string; label: string }>;
  viewports: Record<Viewport, { show: boolean; note: string }>;
  height: number;
};

const ITEMS: Item[] = [
  {
    n: 1,
    id: 'preferred-sources-review-1-post-page-after-copying-the-link',
    name: 'Post page · after copying the link',
    appears:
      'Once, right after the reader upvotes — a strip under the action bar, button right-aligned under Copy.',
    goesAway: 'After click or dismiss, globally.',
    label: 'Add as preferred source',
    approve:
      'The copy-link trigger, the strip under the action bar, and the label.',
    variants: [
      { key: 'current', label: 'Today' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: {
        show: true,
        note: 'Strip under the engagement bar; button right-aligned.',
      },
      tablet: { show: true, note: 'Same.' },
      mobile: {
        show: true,
        note: 'Stacks: text, then button. The floating bar is untouched.',
      },
    },
    height: 900,
  },
  {
    n: 2,
    id: 'preferred-sources-review-2-post-page-under-the-source-card',
    name: 'Post page · under the source card',
    appears:
      'Every post page, signed in, directly under the source card. Equal spacing above and below.',
    goesAway: 'After click or dismiss, globally.',
    label:
      'Pick one: "Make us preferred on Google" or "Add as preferred source"',
    approve: 'The placement, and which of the two labels.',
    variants: [
      { key: 'current', label: 'Today' },
      { key: 'mock-label', label: 'Make us preferred on Google' },
      { key: 'google-label', label: 'Add as preferred source' },
    ],
    viewports: {
      desktop: { show: true, note: 'Rail slot after the source card.' },
      tablet: { show: true, note: 'Widget column renders from 656px.' },
      mobile: {
        show: false,
        note: 'The widget column collapses under the comments on mobile; item 1 covers mobile.',
      },
    },
    height: 900,
  },
  {
    n: 3,
    id: 'preferred-sources-review-3-quest-a-one-time-milestone',
    name: 'Quest · one-time milestone',
    appears: 'Once in the quest list — Game Center card and sidebar row.',
    goesAway: 'Self-capping: completes on click, then claimed.',
    label: 'Make daily.dev a preferred source on Google · 50 Cores + 100 XP',
    approve: 'The quest, its copy, and the reward size.',
    variants: [
      { key: 'current', label: 'Today' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: { show: true, note: 'Card and compact row.' },
      tablet: { show: true, note: 'Same.' },
      mobile: {
        show: true,
        note: 'Quest list is a sheet on mobile; same row.',
      },
    },
    height: 640,
  },
  {
    n: 4,
    id: 'preferred-sources-review-4-notification-after-three-reads',
    name: 'Notification · after three reads',
    appears:
      'Once, the moment the third read of the day completes — in-app popup first, then the same item in the notification centre.',
    goesAway: 'Self-capping — one per user, ever.',
    label:
      '“Three posts today. Want more like this when you search? Add daily.dev as a preferred source on Google.”',
    approve: 'The trigger (three reads), the popup, and the centre row.',
    variants: [
      { key: 'current', label: 'Today' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: { show: true, note: 'Popup bottom-right, then the centre row.' },
      tablet: { show: true, note: 'Same.' },
      mobile: {
        show: true,
        note: 'Popup top-centre; the deeplink opens Google signed in.',
      },
    },
    height: 520,
  },
  {
    n: 5,
    id: 'preferred-sources-review-5-settings-a-permanent-row',
    name: 'Settings · a permanent row',
    appears: 'Always, under Preferences.',
    goesAway:
      'Never — where the ask lives after every other one has gone quiet.',
    label:
      'Add — primary (a button, not a toggle: we cannot read the state back)',
    approve: 'The row, and that it is a button rather than a toggle.',
    variants: [
      { key: 'current', label: 'Today' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: { show: true, note: 'Under Preferences.' },
      tablet: { show: true, note: 'Same.' },
      mobile: {
        show: true,
        note: 'Settings is full-screen on mobile; same row.',
      },
    },
    height: 520,
  },
  {
    n: 6,
    id: 'preferred-sources-review-6-homepage-hero-layout-v2',
    name: 'Homepage · hero (layout v2)',
    appears:
      'Once, above the feed, in the layout-v2 top-banner slot the reading-reminder and CV heroes use.',
    goesAway: 'Close or click; never returns.',
    label:
      '“Add daily.dev and it shows up more often in Top Stories and AI Overviews.” + “Add as preferred source”. No grey label.',
    approve: 'The hero, the single bold line, and the v2 slot.',
    variants: [
      { key: 'current', label: 'Today' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: { show: true, note: 'Real TopHero in the v2 top-banner slot.' },
      tablet: { show: true, note: 'Same.' },
      mobile: {
        show: true,
        note: 'Hero stacks; same component the reminder hero uses on mobile.',
      },
    },
    height: 760,
  },
  {
    n: 7,
    id: 'preferred-sources-review-7-feed-empty-ad-slot',
    name: 'Feed · empty ad slot',
    appears:
      'Only when the ad server returns the placeholder for a feed ad position.',
    goesAway: 'Slot goes back to the placeholder after click or dismiss.',
    label:
      '“See daily.dev in your Google results” — a results snippet with daily.dev marked Preferred — then a primary “Add as preferred source”.',
    approve: 'The card, the snippet illustration, and the primary button.',
    variants: [
      { key: 'current', label: 'Today (placeholder)' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: { show: true, note: 'Same size as every other feed card.' },
      tablet: { show: true, note: 'Two-column grid.' },
      mobile: {
        show: true,
        note: 'Single column; full-width card in the stream.',
      },
    },
    height: 760,
  },
  {
    n: 8,
    id: 'preferred-sources-review-8-streak-popup-day-7',
    name: 'Streak popup · day 7',
    appears:
      'Once, in the Day 7 · Flame milestone popup (milestone-rewards exploration) — the day that today hands out a streak freeze when no partner offer matches.',
    goesAway: 'The popup is a one-time moment; the ask goes with it.',
    label:
      'Three rows, every action primary: A streak freeze → Claim · See daily.dev in your Google results → Add · 10 Cores → Claim.',
    approve: 'The three-row list, the order, and all-primary buttons.',
    variants: [
      { key: 'current', label: 'Today (freeze)' },
      { key: 'proposed', label: 'Proposed' },
    ],
    viewports: {
      desktop: {
        show: true,
        note: 'Two-column moment shell, real flame artwork.',
      },
      tablet: { show: true, note: 'Same.' },
      mobile: {
        show: true,
        note: 'The shell collapses to one column under 44rem.',
      },
    },
    height: 760,
  },
];

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const VIEWPORTS: Viewport[] = ['desktop', 'tablet', 'mobile'];
const SCALE = 0.42;
const widthOf = (vp: Viewport) =>
  vp === 'desktop' ? 1280 : vp === 'tablet' ? 768 : 390;

const Facts = ({ item }: { item: Item }) => (
  <dl
    style={{
      display: 'grid',
      gridTemplateColumns: 'max-content 1fr',
      gap: '4px 14px',
      margin: '0 0 16px',
      fontSize: 13,
      lineHeight: 1.5,
      maxWidth: 860,
    }}
  >
    {[
      ['Appears', item.appears],
      ['Goes away', item.goesAway],
      ['Label', item.label],
      ['You approve', item.approve],
    ].map(([k, v]) => (
      <React.Fragment key={k}>
        <dt
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: '.09em',
            textTransform: 'uppercase',
            color:
              k === 'You approve' ? '#1f9d55' : 'var(--theme-text-tertiary)',
            paddingTop: 3,
          }}
        >
          {k}
        </dt>
        <dd
          style={{
            margin: 0,
            color:
              k === 'You approve'
                ? 'var(--theme-text-primary)'
                : 'var(--theme-text-secondary)',
            textWrap: 'pretty',
          }}
        >
          {v}
        </dd>
      </React.Fragment>
    ))}
  </dl>
);

const Row = ({ item }: { item: Item }) => {
  const proposed = item.variants.filter((v) => v.key !== 'current');
  const [picked, setPicked] = useState(proposed[0]?.key);
  const visible =
    proposed.length > 1
      ? item.variants.filter((v) => v.key === 'current' || v.key === picked)
      : item.variants;

  return (
    <section id={`item-${item.n}`} style={{ padding: '24px 0 8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 14,
            color: '#CE3DF3',
          }}
        >
          {item.n}
        </span>
        <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>
          {item.name}
        </h2>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: proposed.length > 1 ? '#b7791f' : '#1f9d55',
            border: `1px solid ${proposed.length > 1 ? '#b7791f' : '#1f9d55'}`,
            borderRadius: 999,
            padding: '3px 9px',
          }}
        >
          {proposed.length > 1 ? 'Pick one, then approve' : 'Approve'}
        </span>
      </div>
      <Facts item={item} />

      {proposed.length > 1 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 14,
          }}
        >
          {proposed.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setPicked(v.key)}
              style={{
                fontSize: 12,
                fontFamily: 'inherit',
                cursor: 'pointer',
                color:
                  v.key === picked
                    ? 'var(--theme-text-primary)'
                    : 'var(--theme-text-secondary)',
                background:
                  v.key === picked
                    ? 'var(--theme-surface-float)'
                    : 'transparent',
                border: `1px solid ${
                  v.key === picked ? '#1f9d55' : 'var(--theme-divider-tertiary)'
                }`,
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {visible.map((variant) => {
        const isCurrent = variant.key === 'current';

        return (
          <div key={variant.key} style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 8,
                fontFamily: mono,
                fontSize: 10.5,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: isCurrent ? 'var(--theme-text-tertiary)' : '#1f9d55',
              }}
            >
              {isCurrent ? 'Today' : variant.label}
              <a
                href={openHref(`${item.id}--${variant.key}`)}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--theme-text-link)',
                  letterSpacing: 0,
                  textTransform: 'none',
                  fontSize: 12,
                }}
              >
                open full size ↗
              </a>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                overflowX: 'auto',
                paddingBottom: 6,
              }}
            >
              {VIEWPORTS.map((vp) => {
                const rule = item.viewports[vp];
                const skip = !isCurrent && !rule.show;
                const w = widthOf(vp) * SCALE;

                return (
                  <div key={vp} style={{ flex: 'none', width: w }}>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 10,
                        letterSpacing: '.09em',
                        textTransform: 'uppercase',
                        color: skip ? '#d4342c' : 'var(--theme-text-tertiary)',
                        marginBottom: 6,
                      }}
                    >
                      {vp} · {skip ? 'not shown' : rule.show ? 'shown' : '—'}
                    </div>
                    {skip ? (
                      <div
                        style={{
                          minHeight: 120,
                          borderRadius: 10,
                          border: '1px dashed var(--theme-divider-tertiary)',
                          padding: 12,
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: 'var(--theme-text-tertiary)',
                        }}
                      >
                        {rule.note}
                      </div>
                    ) : (
                      <StoryFrame
                        id={`${item.id}--${variant.key}`}
                        viewport={vp}
                        height={item.height}
                        scale={SCALE}
                      />
                    )}
                    {!skip && !isCurrent && (
                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: 'var(--theme-text-tertiary)',
                          marginTop: 6,
                        }}
                      >
                        {rule.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
};

const FinalList = (): React.ReactElement => {
  const [selected, setSelected] = useState(1);
  const item = ITEMS.find((i) => i.n === selected) ?? ITEMS[0];

  return (
    <Page>
      <PageHeader
        eyebrow="Google Preferred Sources · Final list"
        title="Eight designs — every open question closed"
      >
        Only what we agreed is here; every other idea is out of the deck and off
        the branch. Every variant is now decided — go through the numbers in
        order and approve. Each item says exactly what you are approving. Every
        frame is the real product component at a real viewport width.
      </PageHeader>

      <Heading>Approval checklist</Heading>
      <Bullets
        items={ITEMS.map(
          (i) =>
            `${i.n} · ${i.name} — ${
              i.variants.length > 2 ? 'pick a variant, then approve' : 'approve'
            }`,
        )}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          margin: '20px 0 8px',
        }}
      >
        {ITEMS.map((i) => {
          const active = i.n === selected;

          return (
            <button
              key={i.n}
              type="button"
              onClick={() => setSelected(i.n)}
              style={{
                fontSize: 12.5,
                fontFamily: 'inherit',
                cursor: 'pointer',
                color: active
                  ? 'var(--theme-text-primary)'
                  : 'var(--theme-text-secondary)',
                background: active
                  ? 'var(--theme-surface-float)'
                  : 'transparent',
                border: `1px solid ${
                  active ? '#1f9d55' : 'var(--theme-divider-tertiary)'
                }`,
                borderRadius: 999,
                padding: '5px 12px',
              }}
            >
              {i.n} · {i.name}
            </button>
          );
        })}
      </div>

      <Row key={item.n} item={item} />

      <Muted style={{ fontSize: 12.5, marginTop: 24 }}>
        Testing the real thing: the app preview lives at{' '}
        <a
          href="https://google-preferred-sources-dailydo.preview.app.daily.dev"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--theme-text-link)' }}
        >
          google-preferred-sources-dailydo.preview.app.daily.dev
        </a>
        . Use that domain — the raw <code>*.vercel.app</code> preview is
        CORS-blocked by the API and renders an empty shell.
      </Muted>

      <Muted style={{ fontSize: 12.5, marginTop: 12 }}>
        Shared rules for all eight: the click is recorded locally and treated as
        done (Google has no read API), one global dismissal covers every
        surface, and the settings row is the permanent home.
      </Muted>
    </Page>
  );
};

const meta: Meta<typeof FinalList> = {
  title: 'Preferred Sources/Review/0. Final list',
  component: FinalList,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof FinalList> = { name: 'Final list' };
