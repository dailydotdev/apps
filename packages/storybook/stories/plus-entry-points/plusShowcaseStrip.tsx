import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
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
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { usePrefersReducedMotion } from '@dailydotdev/shared/src/hooks/usePrefersReducedMotion';

// The Plus scroll stopper as a showcase: the landing page's glass-and-aurora
// frame, the Plus page's colored feature tiles, and a live mock of the feed
// that changes with the selected feature. Rotates on its own while in view
// until the reader picks a feature, then holds.
//
// Layout follows the strip's own width (container queries), because in the
// feed that width depends on the column count and the sidebar, not just the
// viewport: stacked below 600px, a header row from 600px, two columns from
// 1000px, and a capped preview from 1400px.

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
.light .pss-orb { mix-blend-mode: multiply; opacity: 0.22; animation: none; }
@keyframes pss-breathe {
  0%, 100% { opacity: 0.48; }
  50% { opacity: 0.68; }
}
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
.pss-strike { position: relative; }
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
.pss-fade { transition: opacity 300ms ease-out; }

.pss { container-type: inline-size; }
.pss-body { display: flex; flex-direction: column; gap: 1.25rem; }
.pss-head { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.pss-copy { display: flex; flex: 1 1 0%; flex-direction: column; gap: 0.375rem; min-width: 0; }
.pss-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.pss-stage { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }
.pss-chips {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem 0.125rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.pss-chips::-webkit-scrollbar { display: none; }
@container (max-width: 419px) {
  .pss-title { font-size: 1.25rem; line-height: 1.625rem; }
}
@container (min-width: 600px) {
  .pss-head { flex-direction: row; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .pss-cta { flex-wrap: nowrap; flex-shrink: 0; }
}
@container (min-width: 1000px) {
  .pss-body {
    display: grid;
    grid-template-columns: minmax(15rem, 4fr) minmax(0, 8fr);
    gap: 1.5rem;
    padding: 1.25rem;
  }
  .pss-head { flex-direction: column; align-items: stretch; justify-content: center; gap: 1rem; }
  .pss-copy { flex: 0 0 auto; }
  .pss-cta { flex-wrap: wrap; }
  .pss-chips { flex-wrap: wrap; overflow: visible; margin: 0; padding: 0; }
}
@container (min-width: 1400px) {
  .pss-body { grid-template-columns: minmax(0, 1fr) minmax(0, 52rem); }
}
@media (prefers-reduced-motion: reduce) {
  .pss-orb { animation: none; }
  .pss-progress { animation: none; transform: scaleX(1); }
  .pss-collapse { transition: none; }
  .pss-strike::after { transition: none; }
  .pss-fade { transition: none; }
}
`;

const DWELL_MS = 4200;
const REVEAL_MS = 700;

type Feature = {
  id: string;
  label: string;
  perk: string;
  Icon: ComponentType<IconProps>;
  tile: string;
  Preview: ComponentType<PreviewProps>;
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

const useInView = (
  threshold: number,
): [React.RefObject<HTMLElement>, boolean] => {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

type PreviewProps = { active: boolean; caption: ReactNode };

const Window = ({
  caption,
  children,
}: {
  caption: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex h-full flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
    <div className="flex h-7 shrink-0 items-center border-b border-border-subtlest-tertiary px-1.5">
      {caption}
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
}: {
  source: string;
  title: ReactNode;
  meta?: ReactNode;
  tag?: string;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex items-start gap-2.5 border-b border-border-subtlest-tertiary px-3 py-1.5 last:border-b-0">
    <span
      aria-hidden
      className="mt-0.5 size-5 shrink-0 rounded-6 bg-surface-hover"
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
      <span className="truncate text-text-primary typo-footnote">{title}</span>
      {children}
    </div>
  </div>
);

const AdFreePreview = ({ active, caption }: PreviewProps): ReactElement => {
  const gone = useReveal(active);
  return (
    <Window caption={caption}>
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
    </Window>
  );
};

const CleanTitlesPreview = ({
  active,
  caption,
}: PreviewProps): ReactElement => {
  const clean = useReveal(active);
  return (
    <Window caption={caption}>
      <Row
        source="Dev Weekly"
        meta={
          <span
            className={classNames(
              'pss-fade text-action-plus-default',
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

const CustomFeedsPreview = ({
  active,
  caption,
}: PreviewProps): ReactElement => {
  const picked = useReveal(active);
  return (
    <Window caption={caption}>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-24 shrink-0 flex-col gap-0.5 border-r border-border-subtlest-tertiary p-1.5">
          <span className="px-1.5 pb-0.5 text-text-quaternary typo-caption2">
            Custom feeds
          </span>
          {customFeeds.map((feed, index) => (
            <span
              key={feed}
              className={classNames(
                'flex items-center gap-1 rounded-8 px-1.5 py-0.5 typo-caption1 transition-colors duration-300',
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
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap gap-1 border-b border-border-subtlest-tertiary px-3 py-1.5">
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

const KeywordsPreview = ({ active, caption }: PreviewProps): ReactElement => {
  const gone = useReveal(active);
  return (
    <Window caption={caption}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border-subtlest-tertiary px-3 py-1.5">
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
    </Window>
  );
};

const saved = [
  { title: 'Postgres indexing, the parts that matter', folder: 'Postgres' },
  { title: 'Designing a rate limiter', folder: 'System design' },
  { title: 'Behavioral interview prep for seniors', folder: 'Interviews' },
  { title: 'Vacuum tuning on busy tables', folder: 'Postgres' },
];

const folders = [
  { name: 'Read later', count: 12 },
  { name: 'Postgres', count: 7 },
  { name: 'Interviews', count: 4 },
  { name: 'System design', count: 9 },
];

// Before: a flat pile of saves. After: the same saves in folders.
const FoldersPreview = ({ active, caption }: PreviewProps): ReactElement => {
  const sorted = useReveal(active);
  return (
    <Window caption={caption}>
      {sorted ? (
        <div className="grid grid-cols-2 gap-1.5 p-2.5">
          {folders.map((folder, index) => (
            <div
              key={folder.name}
              className="plus-perk-in flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary px-2 py-1.5"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-overlay-float-bun text-accent-bun-default">
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
      ) : (
        <>
          {saved.slice(0, 3).map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2.5 border-b border-border-subtlest-tertiary px-3 py-1.5 last:border-b-0"
            >
              <BookmarkIcon
                secondary
                size={IconSize.Size16}
                className="shrink-0 text-text-quaternary"
              />
              <span className="min-w-0 flex-1 truncate text-text-primary typo-footnote">
                {item.title}
              </span>
              <span className="text-text-quaternary typo-caption2">Saved</span>
            </div>
          ))}
        </>
      )}
    </Window>
  );
};

const briefLines = [
  'React 19.2 ships View Transitions. Three migration notes for Next apps.',
  'Postgres 18 async I/O: 2x faster sequential scans in early benchmarks.',
  'A CVE in a popular JWT library. Patched versions and who is affected.',
];

// Before: the agent is still scanning. After: the three lines of the brief.
const BriefingPreview = ({ active, caption }: PreviewProps): ReactElement => {
  const ready = useReveal(active);
  return (
    <Window caption={caption}>
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-1.5">
        <span className="flex size-5 items-center justify-center rounded-6 bg-overlay-float-mustard text-accent-mustard-default">
          <BriefIcon secondary size={IconSize.Size16} />
        </span>
        <span className="text-text-primary typo-caption1">
          Presidential Briefing
        </span>
        <span className="ml-auto text-text-quaternary tabular-nums typo-caption2">
          {ready ? 'Today, 08:00' : 'Scanning 5,000+ posts…'}
        </span>
      </div>
      <ol className="flex flex-col gap-1 px-3 py-2">
        {briefLines.map((line, index) => (
          <li
            key={line}
            className="flex items-center gap-2 text-text-secondary typo-caption1"
          >
            <span className="text-text-quaternary tabular-nums">
              {index + 1}.
            </span>
            {ready ? (
              <span
                className="plus-perk-in min-w-0 truncate"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {line}
              </span>
            ) : (
              <span
                aria-hidden
                className="h-2.5 animate-pulse rounded-4 bg-surface-float"
                style={{ width: `${72 - index * 14}%` }}
              />
            )}
          </li>
        ))}
      </ol>
    </Window>
  );
};

export const features: Feature[] = [
  {
    id: 'ad-free',
    label: 'Ad-free',
    perk: 'Removes every ad',
    Icon: BlockIcon,
    tile: 'bg-overlay-float-ketchup text-accent-ketchup-default',
    Preview: AdFreePreview,
  },
  {
    id: 'clean-titles',
    label: 'Clean titles',
    perk: 'Rewrites clickbait titles',
    Icon: ShieldPlusIcon,
    tile: 'bg-overlay-float-avocado text-accent-avocado-default',
    Preview: CleanTitlesPreview,
  },
  {
    id: 'custom-feeds',
    label: 'Custom feeds',
    perk: 'Builds feeds you can query',
    Icon: HashtagIcon,
    tile: 'bg-overlay-float-water text-accent-water-default',
    Preview: CustomFeedsPreview,
  },
  {
    id: 'keywords',
    label: 'Keywords',
    perk: 'Filters out keywords you mute',
    Icon: LabelIcon,
    tile: 'bg-overlay-float-cheese text-accent-cheese-default',
    Preview: KeywordsPreview,
  },
  {
    id: 'folders',
    label: 'Folders',
    perk: 'Organizes bookmarks into folders',
    Icon: FolderIcon,
    tile: 'bg-overlay-float-bun text-accent-bun-default',
    Preview: FoldersPreview,
  },
  {
    id: 'briefing',
    label: 'Briefing',
    perk: 'Unlocks Presidential Briefing',
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
  const chipsRef = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView(0.4);
  const isPlaying = autoplay && inView && !pinned && !isReducedMotion;
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

  // Keeps the active chip visible when the row scrolls (phones, tablets).
  useEffect(() => {
    const chips = chipsRef.current;
    const chip = chips?.querySelector<HTMLElement>(`[data-id="${selected}"]`);
    if (!chips || !chip || chips.scrollWidth <= chips.clientWidth) {
      return;
    }
    chips.scrollTo({
      left: chip.offsetLeft - 16,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  }, [selected, isReducedMotion]);

  const pick = (id: string) => {
    setPinned(true);
    setSelected(id);
  };

  return (
    <section
      ref={inViewRef as React.RefObject<HTMLElement>}
      aria-label="daily.dev Plus"
      className="pss pss-frame relative isolate overflow-hidden rounded-20 p-1.5"
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
      <div className="pss-body pss-glass relative rounded-14 p-4">
        <span
          aria-hidden
          className="pss-topglow pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-14"
        />
        <div className="pss-head relative">
          <div className="pss-copy">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
              className="pss-title text-balance"
            >
              Still scrolling? Upgrade the feed.
            </Typography>
          </div>
          <div className="pss-cta">
            <Button
              tag="a"
              href="/plus"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              icon={<DevPlusIcon secondary />}
            >
              Get Plus
            </Button>
            <span className="whitespace-nowrap text-text-tertiary tabular-nums typo-footnote">
              $7.49/mo, cancel anytime
            </span>
          </div>
        </div>
        <div className="pss-stage relative">
          <div
            ref={chipsRef}
            role="tablist"
            aria-label="Plus features"
            className="pss-chips"
          >
            {features.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  data-id={item.id}
                  aria-selected={active}
                  aria-controls={`pss-panel-${item.id}`}
                  onClick={() => pick(item.id)}
                  className={classNames(
                    'pss-chip relative flex shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-10 border py-1 pl-1 pr-2.5 typo-footnote',
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
            className="plus-perk-in relative flex h-[9.5rem] flex-col"
          >
            <feature.Preview
              active
              caption={
                <span
                  className={classNames(
                    'flex min-w-0 items-center gap-1 rounded-6 px-1.5 py-0.5 typo-caption1',
                    feature.tile,
                  )}
                >
                  <feature.Icon secondary size={IconSize.Size16} />
                  <span className="min-w-0 shrink truncate">
                    {feature.perk}
                  </span>
                </span>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};
