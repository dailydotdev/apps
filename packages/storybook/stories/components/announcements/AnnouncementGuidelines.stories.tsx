import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnnouncementCard } from '@dailydotdev/shared/src/components/announcements/AnnouncementCard';
import { AnnouncementCardVariant } from '@dailydotdev/shared/src/components/announcements/types';
import {
  HotIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { cloudinarySquadsDirectoryCardBannerDefault } from '@dailydotdev/shared/src/lib/image';

const meta: Meta = {
  title: 'Components/Announcements/Guidelines',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: { disable: true },
  },
};

export default meta;

const H = ({ children }: { children: ReactNode }): ReactElement => (
  <h2 className="mt-10 font-bold text-text-primary typo-title2">{children}</h2>
);

const Lead = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="mt-2 max-w-2xl text-text-secondary typo-body">{children}</p>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="mt-4 overflow-hidden rounded-12 border border-border-subtlest-tertiary">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="bg-surface-float">
          {head.map((h) => (
            <th
              key={h}
              className="border-b border-border-subtlest-tertiary p-3 font-bold text-text-primary typo-footnote"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={i} className="align-top">
            {row.map((cell, j) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={j}
                className="border-b border-border-subtlest-quaternary p-3 text-text-secondary typo-footnote"
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

const Code = ({ children }: { children: ReactNode }): ReactElement => (
  <code className="rounded-4 bg-surface-float px-1 py-0.5 font-mono text-text-primary typo-caption1">
    {children}
  </code>
);

const Do = ({
  ok,
  children,
}: {
  ok: boolean;
  children: ReactNode;
}): ReactElement => (
  <li className="flex gap-2 text-text-secondary typo-footnote">
    <span className={ok ? 'text-status-success' : 'text-status-error'}>
      {ok ? '✓' : '✕'}
    </span>
    <span>{children}</span>
  </li>
);

export const Guidelines: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background-default p-8 text-text-primary">
      <div className="max-w-4xl">
        <h1 className="font-bold typo-large-title">Announcement cards</h1>
        <Lead>
          A Linear-style “what’s new” surface for the bottom of the sidebar.
          Use it to prominently announce a new feature or release and drive one
          clear action. Cards stack into a browsable carousel, carry an
          optional “New/Beta” badge, and are dismissible — once dismissed, a
          card stays gone (persisted client-side by id). Keep the list short
          and high-signal: show fewer, better entries.
        </Lead>

        <H>The three tiers</H>
        <Lead>
          Match the tier to the weight of the update. Minor → Compact, standard
          release → Default, headline launch → Cover.
        </Lead>
        <div className="mt-6 flex flex-wrap items-start gap-8">
          {[
            {
              label: 'Compact',
              note: 'Minor update / pointer. Whole row links out.',
              card: (
                <AnnouncementCard
                  variant={AnnouncementCardVariant.Compact}
                  icon={<HotIcon size={IconSize.Small} />}
                  title="Keyboard shortcuts are here"
                  href="#"
                />
              ),
            },
            {
              label: 'Default',
              note: 'Standard release. Badge + body + one CTA.',
              card: (
                <AnnouncementCard
                  variant={AnnouncementCardVariant.Default}
                  icon={<SparkleIcon size={IconSize.Small} />}
                  badge={{ label: 'Updated' }}
                  title="Smarter custom feeds"
                  description="Custom feeds now learn from what you read to surface more of what matters."
                  cta={{ text: 'See what changed', href: '#' }}
                  onClose={() => undefined}
                />
              ),
            },
            {
              label: 'Cover',
              note: 'Headline launch. Adds a cover image on top.',
              card: (
                <AnnouncementCard
                  variant={AnnouncementCardVariant.Cover}
                  image={cloudinarySquadsDirectoryCardBannerDefault}
                  badge={{ label: 'New' }}
                  title="Introducing Clips"
                  description="Save the best moments from any post and share them in one tap."
                  cta={{ text: 'Try Clips', href: '#' }}
                  onClose={() => undefined}
                />
              ),
            },
          ].map(({ label, note, card }) => (
            <div key={label} className="flex w-60 flex-col gap-2">
              <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
                {label}
              </span>
              {card}
              <span className="text-text-tertiary typo-caption1">{note}</span>
            </div>
          ))}
        </div>

        <H>When to use which</H>
        <Table
          head={['Tier', 'Use for', 'Anatomy']}
          rows={[
            [
              <Code key="c">Compact</Code>,
              'Small improvements, settings pointers, “catch up” links.',
              'Leading icon · title (1 line, truncates) · optional subtitle · trailing arrow.',
            ],
            [
              <Code key="d">Default</Code>,
              'A normal feature/release worth a sentence and a CTA.',
              'Badge (+icon) · title · 2-line body · primary CTA · dismiss ×.',
            ],
            [
              <Code key="v">Cover</Code>,
              'Flagship launches that deserve a visual.',
              'Cover image (with overlaid dismiss ×) · badge · title · body · CTA.',
            ],
          ]}
        />

        <H>Specs</H>
        <Table
          head={['Property', 'Value', 'Token / note']}
          rows={[
            [
              'Width',
              '≈ 240px',
              <>
                Built for the expanded sidebar (<Code>w-60</Code>); fills its
                container.
              </>,
            ],
            [
              'Corner radius',
              'Compact 12px · Default/Cover 16px',
              <>
                <Code>rounded-12</Code> / <Code>rounded-16</Code>
              </>,
            ],
            [
              'Padding',
              '12px',
              <>
                <Code>p-3</Code> (Cover body <Code>p-3</Code>, image flush to
                edges)
              </>,
            ],
            [
              'Internal gap',
              '8px between blocks · 12px row gap (Compact)',
              <>
                <Code>gap-2</Code> / <Code>gap-3</Code>
              </>,
            ],
            [
              'Cover image',
              'height 112px, object-cover',
              <>
                <Code>h-28 w-full object-cover</Code>
              </>,
            ],
            [
              'Surface',
              'Floating surface + subtle border',
              <>
                <Code>bg-surface-float</Code> +{' '}
                <Code>border-border-subtlest-tertiary</Code>, hover{' '}
                <Code>border-border-subtlest-secondary</Code>
              </>,
            ],
            [
              'Icon size',
              '24px',
              <>
                <Code>IconSize.Small</Code> (arrow{' '}
                <Code>IconSize.Size16</Code>)
              </>,
            ],
          ]}
        />

        <H>Typography & color</H>
        <Table
          head={['Element', 'Type', 'Color']}
          rows={[
            [
              'Title (Default/Cover)',
              <Code key="t">typo-callout</Code>,
              <Code key="tc">text-text-primary</Code>,
            ],
            [
              'Title (Compact)',
              <Code key="t2">typo-footnote · bold</Code>,
              <Code key="tc2">text-text-primary</Code>,
            ],
            [
              'Body / description',
              <Code key="b">typo-footnote · line-clamp-2</Code>,
              <Code key="bc">text-text-tertiary</Code>,
            ],
            [
              'Badge',
              <Code key="bd">Pill · XSmall (typo-caption2)</Code>,
              <Code key="bdc">bg-accent-cabbage-subtlest · text-brand-default</Code>,
            ],
            [
              'Carousel counter',
              <Code key="cc">typo-caption2</Code>,
              <Code key="ccc">text-text-tertiary</Code>,
            ],
          ]}
        />

        <H>Buttons & dismissal</H>
        <ul className="mt-4 flex max-w-2xl flex-col gap-2">
          <Do ok>
            One primary CTA per card — <Code>ButtonVariant.Primary</Code>,{' '}
            <Code>ButtonSize.Small</Code>, left-aligned under the body.
          </Do>
          <Do ok>
            Dismiss is a <Code>CloseButton</Code> (<Code>XSmall</Code>) top-right.
            Over a cover image use <Code>ButtonVariant.Primary</Code> (Float is
            invisible on imagery); on the solid Default card the Tertiary
            default is fine.
          </Do>
          <Do ok>
            Persist dismissal by <Code>id</Code> so a closed card never returns
            (handled by <Code>useSidebarAnnouncements</Code>).
          </Do>
          <Do ok={false}>
            Don’t stack multiple CTAs or add a separate text “Dismiss” button.
          </Do>
          <Do ok={false}>
            Don’t make a Compact row individually dismissible — it’s a single
            link target (nested buttons are invalid); reserve × for
            Default/Cover.
          </Do>
        </ul>

        <H>Do & don’t</H>
        <ul className="mt-4 flex max-w-2xl flex-col gap-2">
          <Do ok>Keep titles to one line; let the body carry detail (2 lines max).</Do>
          <Do ok>Show 1–4 curated entries, newest first.</Do>
          <Do ok>Hide the whole surface when the sidebar is collapsed or empty.</Do>
          <Do ok={false}>Don’t use a Cover image just to fill space — only for true headline launches.</Do>
          <Do ok={false}>Don’t leave an empty container when there’s nothing to show (render nothing).</Do>
        </ul>
      </div>
    </div>
  ),
};
