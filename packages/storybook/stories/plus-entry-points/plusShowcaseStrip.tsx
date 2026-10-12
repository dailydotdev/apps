import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { BlockIcon } from '@dailydotdev/shared/src/components/icons/Block';
import { ShieldPlusIcon } from '@dailydotdev/shared/src/components/icons/ShieldPlus';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { LabelIcon } from '@dailydotdev/shared/src/components/icons/Label';
import { FolderIcon } from '@dailydotdev/shared/src/components/icons/Folder';
import { BriefIcon } from '@dailydotdev/shared/src/components/icons/Brief';
import { PrivacyIcon } from '@dailydotdev/shared/src/components/icons/Privacy';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { PlusTile } from '@dailydotdev/shared/src/components/plus/PlusPreview';
import { usePrefersReducedMotion } from '@dailydotdev/shared/src/hooks/usePrefersReducedMotion';

// The Plus scroll stopper as a showcase: the landing page's glass-and-aurora
// frame, the Plus page's colored feature tiles, and a live mock of the feed
// that changes with the selected feature. Rotates on its own until the reader
// picks a feature, then holds.

export const STRIP_STYLES = `
.pss-frame {
  border: 1px solid color-mix(in srgb, var(--theme-text-primary) 10%, transparent);
  background: color-mix(in srgb, var(--theme-accent-cabbage-default) 6%, var(--theme-background-default));
}
.pss-glass {
  background: color-mix(in srgb, var(--theme-background-default) 62%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-text-primary) 12%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--theme-text-primary) 10%, transparent);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}
.pss-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(110px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.55;
  animation: pss-breathe 22s ease-in-out infinite;
}
.pss-orb--delay { animation-delay: -8s; }
.light .pss-orb { mix-blend-mode: multiply; opacity: 0.22; }
@keyframes pss-breathe {
  0%, 100% { opacity: 0.48; }
  50% { opacity: 0.68; }
}
.light .pss-orb { animation: none; }
.pss-topglow {
  background:
    radial-gradient(42% 60% at 50% -8%, color-mix(in srgb, var(--theme-accent-cabbage-default) 34%, transparent) 0%, transparent 70%),
    radial-gradient(30% 50% at 10% -12%, color-mix(in srgb, var(--theme-accent-onion-default) 28%, transparent) 0%, transparent 70%),
    radial-gradient(30% 50% at 90% -12%, color-mix(in srgb, var(--theme-accent-bacon-default) 26%, transparent) 0%, transparent 70%);
}
.pss-progress {
  transform-origin: left center;
  animation: pss-progress var(--pss-dwell) linear both;
}
@keyframes pss-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.pss-collapse {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out;
}
.pss-collapse--gone { grid-template-rows: 0fr; opacity: 0; }
.pss-strike {
  position: relative;
}
.pss-strike::after {
  content: '';
  position: absolute;
  left: 0;
  top: 55%;
  height: 1px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pss-strike--on::after { transform: scaleX(1); }
.pss-chip { transition: background-color 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .pss-orb { animation: none; }
  .pss-progress { animation: none; transform: scaleX(1); }
  .pss-collapse { transition: none; }
  .pss-strike::after { transition: none; }
}
`;

const DWELL_MS = 4200;
const REVEAL_MS = 700;

type Feature = {
  id: string;
  label: string;
  perk: string;
  blurb: string;
  Icon: ComponentType<IconProps>;
  tile: string;
  Preview: ComponentType<{ active: boolean }>;
};

const useReveal = (active: boolean): boolean => {
  const isReducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(isReducedMotion);

  useEffect(() => {
    if (!active) {
      setRevealed(isReducedMotion);
      return undefined;
    }
    if (isReducedMotion) {
      setRevealed(true);
      return undefined;
    }
    const id = window.setTimeout(() => setRevealed(true), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [active, isReducedMotion]);

  return revealed;
};

const Window = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex h-full flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default',
      className,
    )}
  >
    <div className="flex items-center gap-1.5 border-b border-border-subtlest-tertiary px-3 py-1.5">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden
          className="size-1.5 rounded-[999px] bg-border-subtlest-secondary"
        />
      ))}
      <span className="ml-1.5 text-text-quaternary typo-caption2">
        app.daily.dev
      </span>
    </div>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </div>
);

const Row = ({
  source,
  title,
  meta,
  tag,
  children,
  muted,
}: {
  source: string;
  title: ReactNode;
  meta?: ReactNode;
  tag?: string;
  children?: ReactNode;
  muted?: boolean;
}): ReactElement => (
  <div className="flex items-start gap-2.5 border-b border-border-subtlest-tertiary px-3 py-2 last:border-b-0">
    <span
      aria-hidden
      className={classNames(
        'mt-0.5 size-5 shrink-0 rounded-6',
        muted ? 'bg-surface-float' : 'bg-surface-hover',
      )}
    />
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-text-quaternary typo-caption2">
        {source}
        {tag && (
          <span className="rounded-4 bg-surface-float px-1 text-text-tertiary">
            {tag}
          </span>
        )}
        {meta}
      </span>
      <span
        className={classNames(
          'truncate typo-footnote',
          muted ? 'text-text-quaternary' : 'text-text-primary',
        )}
      >
        {title}
      </span>
      {children}
    </div>
  </div>
);

const AdFreePreview = ({ active }: { active: boolean }): ReactElement => {
  const gone = useReveal(active);
  return (
    <Window>
      <Row
        source="Postgres"
        title="PostgreSQL 18 ships async I/O for sequential scans"
      />
      <div className={classNames('pss-collapse', gone && 'pss-collapse--gone')}>
        <div className="min-h-0 overflow-hidden">
          <Row
            source="AcmeCloud"
            tag="Ad"
            title="Deploy 10x faster with AcmeCloud. Start free today."
          />
        </div>
      </div>
      <Row
        source="Vercel"
        title="Partial prerendering is now the default in Next 16"
      />
      <Row
        source="GitHub Blog"
        title="Copilot code review learns your team's conventions"
      />
      <div className="mt-auto flex items-center gap-1.5 px-3 py-2 text-text-tertiary typo-caption1">
        <BlockIcon
          secondary
          size={IconSize.Size16}
          className={classNames(
            'transition-colors duration-300',
            gone ? 'text-accent-ketchup-default' : 'text-text-quaternary',
          )}
        />
        {gone ? '1 ad removed from this page' : 'Removing ads…'}
      </div>
    </Window>
  );
};

const CleanTitlesPreview = ({ active }: { active: boolean }): ReactElement => {
  const clean = useReveal(active);
  return (
    <Window>
      <Row
        source="Dev Weekly"
        meta={
          <span
            className={classNames(
              'text-action-plus-default transition-opacity duration-300',
              clean ? 'opacity-100' : 'opacity-0',
            )}
          >
            Clean title by Plus
          </span>
        }
        title={
          <span
            className={classNames(
              'pss-strike',
              clean && 'pss-strike--on text-text-quaternary',
            )}
          >
            You WON’T BELIEVE what this one React hook does
          </span>
        }
      >
        <span
          className={classNames(
            'truncate text-text-primary typo-footnote',
            clean ? 'plus-perk-in' : 'invisible',
          )}
        >
          useTransition keeps inputs responsive during heavy renders
        </span>
      </Row>
      <Row
        source="InfraToday"
        title="A case for running small services on a single VM"
      />
      <Row
        source="CodeBytes"
        title="Ten lesser-known Python standard library helpers"
      />
    </Window>
  );
};

const customFeeds = ['Rust & WASM', 'AI infra', 'Postgres'];

const CustomFeedsPreview = ({ active }: { active: boolean }): ReactElement => {
  const picked = useReveal(active);
  return (
    <Window>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-28 shrink-0 flex-col gap-0.5 border-r border-border-subtlest-tertiary p-2">
          <span className="px-1.5 pb-1 text-text-quaternary typo-caption2">
            Custom feeds
          </span>
          {customFeeds.map((feed, index) => (
            <span
              key={feed}
              className={classNames(
                'flex items-center gap-1.5 rounded-8 px-1.5 py-1 typo-caption1 transition-colors duration-300',
                picked && index === 0
                  ? 'bg-surface-float font-bold text-text-primary'
                  : 'text-text-tertiary',
              )}
            >
              <HashtagIcon
                size={IconSize.Size16}
                className={
                  picked && index === 0
                    ? 'text-accent-water-default'
                    : 'text-text-quaternary'
                }
              />
              {feed}
            </span>
          ))}
          <span className="flex items-center gap-1.5 px-1.5 py-1 text-text-quaternary typo-caption1">
            + New feed
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap gap-1 border-b border-border-subtlest-tertiary px-3 py-2">
            {['rust', 'wasm', 'webassembly', 'tokio'].map((tag) => (
              <span
                key={tag}
                className="rounded-6 bg-surface-float px-1.5 text-text-secondary typo-caption2"
              >
                #{tag}
              </span>
            ))}
          </div>
          <Row
            source="Rust Blog"
            title="Announcing Rust 1.92 with async closures stabilized"
          />
          <Row
            source="Bytecode Alliance"
            title="Wasm components land in the browser behind a flag"
          />
        </div>
      </div>
    </Window>
  );
};

const KeywordsPreview = ({ active }: { active: boolean }): ReactElement => {
  const gone = useReveal(active);
  return (
    <Window>
      <div className="flex flex-wrap items-center gap-1 border-b border-border-subtlest-tertiary px-3 py-2">
        <span className="text-text-quaternary typo-caption2">Muted</span>
        {['crypto', 'web3', 'nft'].map((word) => (
          <span
            key={word}
            className="flex items-center gap-0.5 rounded-6 bg-surface-float pl-1.5 pr-0.5 text-text-secondary typo-caption2"
          >
            {word}
            <MiniCloseIcon
              size={IconSize.Size16}
              className="text-text-quaternary"
            />
          </span>
        ))}
      </div>
      <Row source="Stripe" title="How we cut p99 latency by moving off JSON" />
      <div className={classNames('pss-collapse', gone && 'pss-collapse--gone')}>
        <div className="min-h-0 overflow-hidden">
          <Row
            source="CoinDaily"
            tag="#crypto"
            title="Top 10 altcoins to buy before the halving"
          />
        </div>
      </div>
      <Row
        source="Cloudflare"
        title="Workers now run Python with full stdlib support"
      />
      <div className="mt-auto flex items-center gap-1.5 px-3 py-2 text-text-tertiary typo-caption1">
        <LabelIcon
          secondary
          size={IconSize.Size16}
          className={classNames(
            'transition-colors duration-300',
            gone ? 'text-accent-cheese-default' : 'text-text-quaternary',
          )}
        />
        {gone ? 'Hidden: 1 post about crypto' : 'Applying your filters…'}
      </div>
    </Window>
  );
};

const folders = [
  { name: 'Read later', count: 12 },
  { name: 'Postgres', count: 7 },
  { name: 'Interviews', count: 4 },
  { name: 'System design', count: 9 },
];

const FoldersPreview = ({ active }: { active: boolean }): ReactElement => {
  const sorted = useReveal(active);
  return (
    <Window>
      <div className="grid grid-cols-2 gap-2 p-3">
        {folders.map((folder, index) => (
          <div
            key={folder.name}
            className={classNames(
              'flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary px-2.5 py-2',
              sorted ? 'plus-perk-in' : 'opacity-0',
            )}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span className="flex size-7 items-center justify-center rounded-8 bg-overlay-float-bun text-accent-bun-default">
              <FolderIcon secondary size={IconSize.Size16} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-text-primary typo-caption1">
                {folder.name}
              </span>
              <span className="text-text-quaternary tabular-nums typo-caption2">
                {folder.count} saved
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto px-3 pb-2 text-text-tertiary typo-caption1">
        {sorted ? '32 bookmarks, four folders.' : 'Sorting your saves…'}
      </div>
    </Window>
  );
};

const briefLines = [
  'React 19.2 ships View Transitions. Three migration notes for Next apps.',
  'Postgres 18 async I/O: 2x faster sequential scans in early benchmarks.',
  'A CVE in a popular JWT library. Patched versions and who is affected.',
];

const BriefingPreview = ({ active }: { active: boolean }): ReactElement => {
  const ready = useReveal(active);
  return (
    <Window>
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-2">
        <span className="flex size-6 items-center justify-center rounded-8 bg-overlay-float-mustard text-accent-mustard-default">
          <BriefIcon secondary size={IconSize.Size16} />
        </span>
        <span className="text-text-primary typo-caption1">
          Presidential Briefing
        </span>
        <span className="ml-auto text-text-quaternary typo-caption2">
          Today, 08:00
        </span>
      </div>
      <ol className="flex flex-col gap-1.5 px-3 py-2.5">
        {briefLines.map((line, index) => (
          <li
            key={line}
            className={classNames(
              'flex gap-2 text-text-secondary typo-caption1',
              ready ? 'plus-perk-in' : 'opacity-0',
            )}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="text-text-quaternary tabular-nums">
              {index + 1}.
            </span>
            <span className="min-w-0">{line}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto px-3 pb-2 text-text-tertiary typo-caption1">
        {ready ? '5,000+ posts scanned. 3 min read.' : 'Scanning the feed…'}
      </div>
    </Window>
  );
};

export const features: Feature[] = [
  {
    id: 'ad-free',
    label: 'Ad-free',
    perk: 'Removes every ad',
    blurb: 'No ads, no sponsored cards. Your feed, distraction-free.',
    Icon: BlockIcon,
    tile: 'bg-overlay-float-ketchup text-accent-ketchup-default',
    Preview: AdFreePreview,
  },
  {
    id: 'clean-titles',
    label: 'Clean titles',
    perk: 'Rewrites clickbait titles',
    blurb: 'AI rewrites the bait so you see the real story at a glance.',
    Icon: ShieldPlusIcon,
    tile: 'bg-overlay-float-avocado text-accent-avocado-default',
    Preview: CleanTitlesPreview,
  },
  {
    id: 'custom-feeds',
    label: 'Custom feeds',
    perk: 'Builds feeds you can query',
    blurb:
      'Laser-focused feeds for the tools, languages, and topics you care about.',
    Icon: HashtagIcon,
    tile: 'bg-overlay-float-water text-accent-water-default',
    Preview: CustomFeedsPreview,
  },
  {
    id: 'keywords',
    label: 'Keywords',
    perk: 'Filters out keywords you mute',
    blurb: 'Mute the buzzwords once. They stay muted in every feed.',
    Icon: LabelIcon,
    tile: 'bg-overlay-float-cheese text-accent-cheese-default',
    Preview: KeywordsPreview,
  },
  {
    id: 'folders',
    label: 'Folders',
    perk: 'Organizes bookmarks into folders',
    blurb: 'Sort what you save so you can find it again.',
    Icon: FolderIcon,
    tile: 'bg-overlay-float-bun text-accent-bun-default',
    Preview: FoldersPreview,
  },
  {
    id: 'briefing',
    label: 'Briefing',
    perk: 'Unlocks Presidential Briefing',
    blurb: 'Your AI agent scans the whole feed and briefs you in minutes.',
    Icon: BriefIcon,
    tile: 'bg-overlay-float-mustard text-accent-mustard-default',
    Preview: BriefingPreview,
  },
];

interface PlusShowcaseStripProps {
  autoplay?: boolean;
  initialFeature?: string;
}

export const PlusShowcaseStrip = ({
  autoplay = true,
  initialFeature = features[0].id,
}: PlusShowcaseStripProps): ReactElement => {
  const isReducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState(initialFeature);
  const [pinned, setPinned] = useState(false);
  const isPlaying = autoplay && !pinned && !isReducedMotion;
  const feature = features.find((item) => item.id === selected) ?? features[0];

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      setSelected((current) => {
        const index = features.findIndex((item) => item.id === current);
        return features[(index + 1) % features.length].id;
      });
    }, DWELL_MS);
    return () => window.clearTimeout(id);
  }, [isPlaying, selected]);

  const pick = (id: string) => {
    setPinned(true);
    setSelected(id);
  };

  return (
    <section
      aria-label="daily.dev Plus"
      className="pss-frame relative isolate overflow-hidden rounded-24 p-2"
    >
      <span
        aria-hidden
        className="pss-orb -left-24 -top-32 size-80 bg-accent-cabbage-default"
      />
      <span
        aria-hidden
        className="pss-orb pss-orb--delay -right-16 -top-24 size-72 bg-accent-water-default"
      />
      <span
        aria-hidden
        className="pss-orb -bottom-40 left-1/3 size-64 bg-accent-bacon-default"
      />
      <div className="pss-glass relative flex flex-col gap-6 rounded-16 p-5 laptop:grid laptop:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] laptop:gap-8 laptop:p-6">
        <span
          aria-hidden
          className="pss-topglow pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-16"
        />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <PlusTile />
            <Typography type={TypographyType.Callout} bold>
              daily.dev Plus
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title1}
              bold
              className="text-balance"
            >
              Still scrolling? Upgrade the feed.
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="text-pretty"
            >
              Six things Plus does to the feed you already read every day. Pick
              one to see it happen.
            </Typography>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-1.5 tabular-nums">
              <Typography type={TypographyType.Title2} bold>
                $7.49
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                /mo, billed $89.99 a year
              </Typography>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                tag="a"
                href="/plus"
                variant={ButtonVariant.Primary}
                color={ButtonColor.Bacon}
                size={ButtonSize.Medium}
                icon={<DevPlusIcon secondary />}
              >
                Get Plus
              </Button>
              <Button
                tag="a"
                href="/plus"
                variant={ButtonVariant.Float}
                size={ButtonSize.Medium}
              >
                See all features
              </Button>
            </div>
            <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
              <PrivacyIcon
                secondary
                size={IconSize.Size16}
                className="text-accent-blueCheese-default"
              />
              30 day hassle-free refund. Cancel anytime.
            </div>
          </div>
        </div>
        <div className="relative flex min-w-0 flex-col gap-3">
          <div
            role="tablist"
            aria-label="Plus features"
            className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 laptop:mx-0 laptop:flex-wrap laptop:overflow-visible laptop:px-0 laptop:pb-0"
          >
            {features.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`pss-panel-${item.id}`}
                  onClick={() => pick(item.id)}
                  className={classNames(
                    'pss-chip relative flex shrink-0 items-center gap-2 overflow-hidden rounded-12 border py-1.5 pl-1.5 pr-2.5 typo-footnote',
                    active
                      ? 'border-border-subtlest-primary bg-surface-float font-bold text-text-primary shadow-2'
                      : 'border-border-subtlest-tertiary text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                  )}
                >
                  <span
                    className={classNames(
                      'flex size-6 items-center justify-center rounded-8',
                      item.tile,
                    )}
                  >
                    <item.Icon secondary size={IconSize.Size16} />
                  </span>
                  {item.label}
                  {active && isPlaying && (
                    <span
                      key={selected}
                      aria-hidden
                      className="pss-progress absolute inset-x-0 bottom-0 h-0.5 bg-action-plus-default"
                      style={{ '--pss-dwell': `${DWELL_MS}ms` } as never}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div
            id={`pss-panel-${feature.id}`}
            role="tabpanel"
            key={feature.id}
            className="plus-perk-in flex h-[13.5rem] flex-col laptop:h-[14.5rem]"
          >
            <feature.Preview active />
          </div>
          <div
            key={`${feature.id}-caption`}
            className="plus-perk-in flex items-center gap-2"
          >
            <span
              className={classNames(
                'flex size-7 shrink-0 items-center justify-center rounded-8',
                feature.tile,
              )}
            >
              <feature.Icon secondary size={IconSize.Size16} />
            </span>
            <p className="min-w-0 flex-1 text-text-secondary typo-callout">
              <span className="font-bold text-text-primary">
                {feature.perk}.
              </span>{' '}
              {feature.blurb}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
