import type {
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react';
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
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { usePrefersReducedMotion } from '@dailydotdev/shared/src/hooks/usePrefersReducedMotion';

// The Plus scroll stopper as a showcase: the landing page's glass frame and,
// for each feature, a short skeleton scene drawn in the feed's own shapes.
// Only the element that changes carries real text. Rotates on its own while
// in view until the reader picks a feature, then holds.
//
// Layout follows the strip's own width (container queries), because in the
// feed that width depends on the column count and the sidebar, not just the
// viewport: stacked below 600px, a header row from 600px, two columns from
// 1000px, and a capped preview from 1400px.

export const STRIP_STYLES = `
.pss-frame {
  border: 1px solid color-mix(in srgb, var(--theme-text-primary) 10%, transparent);
  background: color-mix(in srgb, var(--theme-accent-cabbage-default) 3%, var(--theme-background-default));
}
.pss-glass {
  background: color-mix(in srgb, var(--theme-background-default) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--theme-text-primary) 12%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--theme-text-primary) 10%, transparent);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
}
.pss-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(110px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.3;
  animation: pss-breathe 22s ease-in-out infinite;
}
.pss-orb--delay { animation-delay: -8s; }
.light .pss-orb { mix-blend-mode: multiply; opacity: 0.12; animation: none; }
@keyframes pss-breathe {
  0%, 100% { opacity: 0.24; }
  50% { opacity: 0.36; }
}
.pss-topglow {
  background:
    radial-gradient(42% 60% at 50% -8%, color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%, transparent 70%),
    radial-gradient(30% 50% at 10% -12%, color-mix(in srgb, var(--theme-accent-onion-default) 14%, transparent) 0%, transparent 70%);
}
.pss-progress {
  transform-origin: left center;
  animation: pss-progress var(--pss-dwell) linear both;
}
@keyframes pss-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.pss-chip { transition: background-color 150ms ease-out, color 150ms ease-out; }

.pss-row {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease-out;
}
.pss-row > div { min-height: 0; overflow: hidden; }
.pss-row--gone { grid-template-rows: 0fr; opacity: 0; }
.pss-scene {
  -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent);
  mask-image: linear-gradient(to bottom, #000 72%, transparent);
}
.pss-tint {
  border-color: color-mix(in srgb, var(--pss-c) 48%, transparent);
  background-color: color-mix(in srgb, var(--pss-c) 10%, var(--theme-background-subtle));
}
.pss-tint-soft { background-color: color-mix(in srgb, var(--pss-c) 12%, transparent); }
.pss-tint-chip {
  color: var(--pss-c);
  background-color: color-mix(in srgb, var(--pss-c) 16%, transparent);
}
.pss-tint-text { color: var(--pss-c); }
.pss-strike { position: relative; }
.pss-strike::after {
  content: '';
  position: absolute;
  left: 0;
  top: 52%;
  height: 2px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pss-strike--on::after { transform: scaleX(1); }

.pss { container-type: inline-size; }
.pss-body { display: flex; flex-direction: column; gap: 1.25rem; }
.pss-head { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.pss-copy { display: flex; flex: 1 1 0%; flex-direction: column; gap: 0.375rem; min-width: 0; }
.pss-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.pss-stage { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }
.pss-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  margin: 0 -1rem;
  padding: 0 1rem 0.125rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.pss-tabs::-webkit-scrollbar { display: none; }
.pss-tab { display: flex; flex-direction: column; justify-content: center; height: 2rem; padding: 0 0.625rem; white-space: nowrap; text-align: left; }
.pss-window { position: relative; display: flex; flex-direction: column; height: 15rem; overflow: hidden; }
@container (max-width: 419px) {
  .pss-title { font-size: 1.25rem; line-height: 1.625rem; }
}
@container (min-width: 600px) {
  .pss-head { flex-direction: row; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .pss-cta { flex-wrap: nowrap; flex-shrink: 0; }
  .pss-stage { flex-direction: row; align-items: stretch; gap: 1rem; }
  .pss-tabs { flex-direction: column; flex-shrink: 0; width: 13rem; gap: 0.125rem; overflow: visible; margin: 0; padding: 0; }
  .pss-tab { height: 2rem; padding: 0 0.625rem; }
  .pss-window { flex: 1 1 0%; height: auto; min-height: 13.5rem; }
  .pss-progress { inset: 0.5rem auto 0.5rem 0; width: 2px; height: auto; transform-origin: top center; animation-name: pss-progress-y; }
}
@container (min-width: 1000px) {
  .pss-body {
    display: grid;
    grid-template-columns: minmax(14rem, 1fr) auto;
    gap: 1.5rem;
    padding: 0 0 0 1.25rem;
    min-height: 15.5rem;
  }
  .pss-head { flex-direction: column; align-items: stretch; justify-content: center; gap: 1rem; padding: 1rem 0; }
  .pss-copy { flex: 0 0 auto; }
  .pss-cta { flex-wrap: wrap; }
  .pss-tabs { justify-content: center; padding: 1rem 0; }
  .pss-window { flex: none; width: 30rem; min-height: 0; border-width: 0 0 0 1px; border-radius: 0 0.875rem 0.875rem 0; }
}
@container (min-width: 1400px) {
  .pss-window { width: 36rem; }
}
@keyframes pss-progress-y {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@media (prefers-reduced-motion: reduce) {
  .pss-row, .pss-strike::after { transition: none; }
  .pss-orb { animation: none; }
  .pss-progress { animation: none; transform: scaleX(1); }
}
`;

const DWELL_MS = 4200;

// Steps through a vignette: returns how many of the given moments (ms after
// mount) have passed. Reduced motion jumps straight to the end state.
const useTimeline = (moments: number[]): number => {
  const isReducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(isReducedMotion ? moments.length : 0);
  const key = moments.join(',');

  useEffect(() => {
    const times = key.split(',').map(Number);
    if (isReducedMotion) {
      setStep(times.length);
      return undefined;
    }
    const ids = times.map((ms, index) =>
      window.setTimeout(() => setStep(index + 1), ms),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [key, isReducedMotion]);

  return step;
};

type Feature = {
  id: string;
  label: string;
  perk: string;
  Icon: ComponentType<IconProps>;
  accent: Accent;
  Preview: ComponentType;
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

/* Skeleton pieces in the shapes of the real feed. */

const Bar = ({
  width,
  className = 'h-2',
}: {
  width: string;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames('block rounded-[999px] bg-surface-float', className)}
    style={{ width }}
  />
);

const Avatar = (): ReactElement => (
  <span
    aria-hidden
    className="size-5 shrink-0 rounded-[999px] bg-surface-float"
  />
);

type Accent =
  | 'blueCheese'
  | 'ketchup'
  | 'cheese'
  | 'avocado'
  | 'water'
  | 'bun'
  | 'onion';

const tone = (accent?: Accent): CSSProperties | undefined =>
  accent
    ? ({ '--pss-c': `var(--theme-accent-${accent}-default)` } as CSSProperties)
    : undefined;

const Pill = ({
  accent,
  children,
}: {
  accent?: Accent;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-5 shrink-0 items-center gap-1 rounded-6 px-1.5 typo-caption2 transition-colors duration-300',
      accent
        ? 'pss-tint-chip font-bold'
        : 'bg-surface-float text-text-secondary',
    )}
    style={tone(accent)}
  >
    {children}
  </span>
);

interface CardProps {
  source?: string;
  meta?: ReactNode;
  title?: ReactNode;
  tag?: string;
  tagAccent?: Accent;
  accent?: Accent;
}

const Card = ({
  source,
  meta,
  title,
  tag,
  tagAccent,
  accent,
}: CardProps): ReactElement => (
  <div
    className={classNames(
      'flex min-h-[5.75rem] gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 transition-colors duration-300',
      accent && 'pss-tint',
    )}
    style={tone(accent)}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Avatar />
        {source ? (
          <span className="truncate text-text-tertiary typo-caption1">
            {source}
          </span>
        ) : (
          <Bar width="28%" className="h-1.5" />
        )}
        {meta}
      </div>
      {title ?? (
        <>
          <Bar width="90%" className="h-2.5" />
          <Bar width="62%" className="h-2.5" />
        </>
      )}
      <div className="mt-auto flex items-center gap-2">
        {tag ? (
          <Pill accent={tagAccent}>#{tag}</Pill>
        ) : (
          <Bar width="18%" className="h-1.5" />
        )}
        <Bar width="10%" className="h-1.5" />
        <Bar width="10%" className="h-1.5" />
      </div>
    </div>
    <span
      aria-hidden
      className="w-[4.5rem] shrink-0 rounded-10 bg-surface-float"
    />
  </div>
);

const Title = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
    {children}
  </span>
);

const Row = ({
  gone = false,
  enter = false,
  delay = 0,
  children,
}: {
  gone?: boolean;
  enter?: boolean;
  delay?: number;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('pss-row', gone && 'pss-row--gone')}>
    <div>
      <div
        className={classNames('pb-2', enter && 'plus-perk-in')}
        style={enter ? { animationDelay: `${delay}ms` } : undefined}
      >
        {children}
      </div>
    </div>
  </div>
);

const Scene = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    aria-hidden
    className="pss-scene relative min-h-0 flex-1 overflow-hidden"
  >
    <div className="absolute inset-x-0 top-0 mx-auto flex max-w-[28rem] flex-col px-3 pt-3">
      {children}
    </div>
  </div>
);

const Window = ({
  id,
  perk,
  children,
}: {
  id: string;
  perk: string;
  children: ReactNode;
}): ReactElement => (
  <div
    id={`pss-panel-${id}`}
    role="tabpanel"
    aria-label={perk}
    className="pss-window rounded-12 border border-border-subtlest-tertiary bg-background-default"
  >
    <div className="flex h-8 shrink-0 items-center border-b border-border-subtlest-tertiary px-3">
      <span className="truncate font-bold text-text-primary typo-footnote">
        {perk}
      </span>
    </div>
    {children}
  </div>
);

/* One scene per feature. */

const AdFreePreview = (): ReactElement => {
  const gone = useTimeline([1100]) >= 1;
  return (
    <Scene>
      <Row gone={gone}>
        <Card
          accent="blueCheese"
          source="Northwind Cloud"
          meta={<Pill accent="blueCheese">Promoted</Pill>}
          title={
            <Title>Ship preview environments for every pull request</Title>
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const CleanTitlesPreview = (): ReactElement => {
  const step = useTimeline([800, 1500]);
  const clean = step >= 2;
  return (
    <Scene>
      <Row>
        <Card
          accent={clean ? 'avocado' : 'cheese'}
          source="Dev Weekly"
          tag="react"
          meta={
            clean ? (
              <Pill accent="avocado">
                <ShieldPlusIcon secondary size={IconSize.Size16} />
                Clickbait-free
              </Pill>
            ) : (
              <Pill accent="cheese">Clickbait</Pill>
            )
          }
          title={
            clean ? (
              <span key="clean" className="plus-perk-in">
                <Title>
                  useTransition keeps inputs responsive during heavy renders
                </Title>
              </span>
            ) : (
              <Title>
                <span
                  className={classNames(
                    'pss-strike',
                    step >= 1 && 'pss-strike--on text-text-tertiary',
                  )}
                >
                  You WON’T BELIEVE what this one React hook does
                </span>
              </Title>
            )
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const FeedTab = ({
  active = false,
  accent,
  children,
}: {
  active?: boolean;
  accent?: Accent;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-7 items-center gap-1 rounded-10 px-2.5 font-bold typo-footnote transition-colors duration-300',
      active && accent && 'pss-tint-chip',
      active && !accent && 'bg-surface-float text-text-primary',
      !active && 'text-text-tertiary',
    )}
    style={tone(accent)}
  >
    <HashtagIcon size={IconSize.Size16} />
    {children}
  </span>
);

const mixedFeed = [{ tag: 'career' }, { tag: 'design' }, { tag: 'kubernetes' }];
const aiCodingFeed = [
  {
    tag: 'claude-code',
    source: 'Anthropic',
    title: 'Claude Code can now run agents in the background',
  },
  {
    tag: 'llm',
    source: 'ByteByteGo',
    title: 'Why models forget the middle of your prompt',
  },
  {
    tag: 'ai-coding',
    source: 'sean goedecke',
    title: 'How to review code your agent wrote',
  },
];

const CustomFeedsPreview = (): ReactElement => {
  const step = useTimeline([700, 1500]);
  const switched = step >= 2;
  const feed: { tag: string; source?: string; title?: string }[] = switched
    ? aiCodingFeed
    : mixedFeed;
  return (
    <Scene>
      <div className="flex items-center gap-1 pb-3">
        <FeedTab active={!switched}>My feed</FeedTab>
        {step >= 1 && (
          <span className="plus-perk-in">
            <FeedTab active={switched} accent="water">
              AI coding
            </FeedTab>
          </span>
        )}
        {step < 1 && (
          <span className="flex size-7 items-center justify-center rounded-10 text-text-tertiary">
            <PlusIcon size={IconSize.Size16} />
          </span>
        )}
      </div>
      {feed.map((post, index) => (
        <Row key={post.tag} enter={switched} delay={index * 90}>
          <Card
            tag={post.tag}
            tagAccent={switched ? 'water' : undefined}
            source={post.source}
            title={post.title && <Title>{post.title}</Title>}
          />
        </Row>
      ))}
    </Scene>
  );
};

const KeywordsPreview = (): ReactElement => {
  const step = useTimeline([700, 1700]);
  return (
    <Scene>
      <div className="flex h-7 items-center gap-2 pb-3">
        <span className="text-text-tertiary typo-footnote">Muted words</span>
        {step >= 1 && (
          <span
            className="pss-tint-chip plus-perk-in flex h-7 items-center gap-1 rounded-10 px-2.5 font-bold typo-footnote"
            style={tone('ketchup')}
          >
            crypto
            <BlockIcon size={IconSize.Size16} />
          </span>
        )}
        {step >= 2 && (
          <span className="plus-perk-in ml-auto text-text-tertiary typo-caption1">
            1 post hidden
          </span>
        )}
      </div>
      <Row gone={step >= 2}>
        <Card
          accent={step >= 1 ? 'ketchup' : undefined}
          source="Coin Weekly"
          tag="crypto"
          title={
            <Title>
              10 crypto coins every developer should buy before 2027
            </Title>
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const folders = [
  {
    name: 'AI coding',
    count: 12,
    latest: 'Why models forget the middle of your prompt',
  },
  { name: 'Rust', count: 7, latest: 'Microsoft doubles down on Rust' },
  {
    name: 'System design',
    count: 9,
    latest: 'Designing a rate limiter that scales',
  },
];

const FoldersPreview = (): ReactElement => {
  const shown = useTimeline([700, 1000, 1300]);
  return (
    <Scene>
      <div className="flex flex-col gap-0.5">
        {folders.map(
          (folder, index) =>
            index < shown && (
              <div
                key={folder.name}
                className="pss-tint-soft plus-perk-in flex h-12 items-center gap-2.5 rounded-10 px-2.5"
                style={tone('bun')}
              >
                <FolderIcon
                  secondary
                  size={IconSize.Size16}
                  className="pss-tint-text"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold text-text-primary typo-footnote">
                    {folder.name}
                  </span>
                  <span className="truncate text-text-tertiary typo-caption2">
                    {folder.latest}
                  </span>
                </span>
                <span className="pss-tint-text font-bold tabular-nums typo-caption1">
                  {folder.count}
                </span>
              </div>
            ),
        )}
        {[74, 58, 66, 50, 70].map((width) => (
          <div key={width} className="flex h-9 items-center gap-2 px-2.5">
            <BookmarkIcon
              size={IconSize.Size16}
              className="text-text-quaternary"
            />
            <Bar width={`${width}%`} />
          </div>
        ))}
      </div>
    </Scene>
  );
};

const briefItems = [
  'Next.js 16.4 makes Turbopack the default for builds',
  'Microsoft starts shipping Rust in Windows kernel drivers',
  'A popular JWT library has a CVE: who needs to patch',
];

const BriefingPreview = (): ReactElement => {
  const arrived = useTimeline([900]) >= 1;
  return (
    <Scene>
      <Row gone={!arrived} enter={arrived}>
        <div
          className="pss-tint flex flex-col gap-2 rounded-16 border p-3"
          style={tone('onion')}
        >
          <div className="flex items-center gap-2">
            <BriefIcon
              secondary
              size={IconSize.Size16}
              className="pss-tint-text"
            />
            <span className="flex-1 font-bold text-text-primary typo-footnote">
              Your briefing is ready
            </span>
            <span className="text-text-tertiary typo-caption1">3 min read</span>
          </div>
          {briefItems.map((item, index) => (
            <div key={item} className="flex items-baseline gap-2">
              <span className="w-3 shrink-0 text-text-tertiary tabular-nums typo-caption1">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-secondary typo-caption1">
                {item}
              </span>
            </div>
          ))}
          <span className="text-text-quaternary typo-caption2">
            From 5,214 posts across 312 sources
          </span>
        </div>
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

export const features: Feature[] = [
  {
    id: 'ad-free',
    accent: 'blueCheese',
    label: 'Ad-free',
    perk: 'Removes every ad',
    Icon: BlockIcon,
    Preview: AdFreePreview,
  },
  {
    id: 'briefing',
    accent: 'onion',
    label: 'Presidential Briefing',
    perk: 'Unlocks Presidential Briefing',
    Icon: BriefIcon,
    Preview: BriefingPreview,
  },
  {
    id: 'clean-titles',
    accent: 'avocado',
    label: 'Clickbait-free titles',
    perk: 'Rewrites clickbait titles',
    Icon: ShieldPlusIcon,
    Preview: CleanTitlesPreview,
  },
  {
    id: 'custom-feeds',
    accent: 'water',
    label: 'Custom feeds',
    perk: 'Builds feeds you can query, like AI coding',
    Icon: HashtagIcon,
    Preview: CustomFeedsPreview,
  },
  {
    id: 'keywords',
    accent: 'ketchup',
    label: 'Keyword filters',
    perk: 'Hides posts with words you mute, like “crypto”',
    Icon: LabelIcon,
    Preview: KeywordsPreview,
  },
  {
    id: 'folders',
    accent: 'bun',
    label: 'Folders',
    perk: 'Organizes bookmarks into folders',
    Icon: FolderIcon,
    Preview: FoldersPreview,
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
        className="pss-orb pss-orb--delay -right-16 -top-24 size-72 bg-accent-onion-default"
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
              className="pss-title"
            >
              <span className="block">Still scrolling?</span>
              <span className="block">Upgrade the feed.</span>
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
            aria-orientation="vertical"
            className="pss-tabs"
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
                    'pss-tab pss-chip relative shrink-0 overflow-hidden rounded-10 typo-footnote',
                    active
                      ? 'bg-surface-float text-text-primary'
                      : 'text-text-tertiary hover:bg-surface-hover hover:text-text-secondary',
                  )}
                >
                  <span
                    className={classNames(
                      'flex items-center gap-1.5',
                      active && 'font-bold',
                    )}
                  >
                    <span
                      className={classNames('flex', active && 'pss-tint-text')}
                      style={tone(item.accent)}
                    >
                      <item.Icon secondary={active} size={IconSize.Size16} />
                    </span>
                    {item.label}
                  </span>
                  {active && isPlaying && (
                    <span
                      key={selected}
                      aria-hidden
                      className="pss-progress absolute inset-x-2.5 bottom-0 h-px bg-text-primary"
                      style={{ '--pss-dwell': `${DWELL_MS}ms` } as never}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <Window key={feature.id} id={feature.id} perk={feature.perk}>
            <feature.Preview />
          </Window>
        </div>
      </div>
    </section>
  );
};
