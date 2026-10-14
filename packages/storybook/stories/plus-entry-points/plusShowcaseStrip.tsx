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
  .pss-tabs { flex-direction: column; flex-shrink: 0; width: 11.5rem; gap: 0.125rem; overflow: visible; margin: 0; padding: 0; }
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

const Pill = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="flex h-5 shrink-0 items-center gap-1 rounded-6 bg-surface-float px-1.5 text-text-secondary typo-caption2">
    {children}
  </span>
);

interface CardProps {
  meta?: ReactNode;
  title?: ReactNode;
  tag?: string;
  focus?: boolean;
}

const Card = ({ meta, title, tag, focus = false }: CardProps): ReactElement => (
  <div
    className={classNames(
      'flex h-[5.75rem] gap-3 rounded-16 border p-3 transition-colors duration-300',
      focus
        ? 'border-border-subtlest-secondary bg-surface-float'
        : 'border-border-subtlest-tertiary bg-background-subtle',
    )}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Avatar />
        <Bar width="28%" className="h-1.5" />
        {meta}
      </div>
      {title ?? (
        <>
          <Bar width="90%" className="h-2.5" />
          <Bar width="62%" className="h-2.5" />
        </>
      )}
      <div className="mt-auto flex items-center gap-2">
        {tag ? <Pill>#{tag}</Pill> : <Bar width="18%" className="h-1.5" />}
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
          focus
          meta={<Pill>Promoted</Pill>}
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
          focus
          meta={
            clean ? (
              <Pill>
                <ShieldPlusIcon secondary size={IconSize.Size16} />
                Clean title
              </Pill>
            ) : (
              <Pill>Clickbait</Pill>
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
  children,
}: {
  active?: boolean;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-7 items-center gap-1 rounded-10 px-2.5 font-bold typo-footnote transition-colors duration-300',
      active ? 'bg-surface-float text-text-primary' : 'text-text-tertiary',
    )}
  >
    <HashtagIcon size={IconSize.Size16} />
    {children}
  </span>
);

const mixedTags = ['career', 'design', 'kubernetes'];
const aiCodingTags = ['ai-coding', 'llm', 'claude-code'];

const CustomFeedsPreview = (): ReactElement => {
  const step = useTimeline([700, 1500]);
  const switched = step >= 2;
  const tags = switched ? aiCodingTags : mixedTags;
  return (
    <Scene>
      <div className="flex items-center gap-1 pb-3">
        <FeedTab active={!switched}>My feed</FeedTab>
        {step >= 1 && (
          <span className="plus-perk-in">
            <FeedTab active={switched}>AI coding</FeedTab>
          </span>
        )}
        {step < 1 && (
          <span className="flex size-7 items-center justify-center rounded-10 text-text-tertiary">
            <PlusIcon size={IconSize.Size16} />
          </span>
        )}
      </div>
      {tags.map((tag, index) => (
        <Row key={tag} enter={switched} delay={index * 90}>
          <Card tag={tag} />
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
          <span className="plus-perk-in flex h-7 items-center gap-1 rounded-10 bg-surface-float px-2.5 font-bold text-text-primary typo-footnote">
            Big AI
            <BlockIcon size={IconSize.Size16} />
          </span>
        )}
      </div>
      <Row gone={step >= 2}>
        <Card
          focus={step >= 1}
          title={<Title>Big AI is coming for your job, again</Title>}
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
  { name: 'AI coding', count: 12 },
  { name: 'Rust', count: 7 },
  { name: 'System design', count: 9 },
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
                className="plus-perk-in flex h-9 items-center gap-2 rounded-10 bg-surface-float px-2.5"
              >
                <FolderIcon
                  secondary
                  size={IconSize.Size16}
                  className="text-text-primary"
                />
                <span className="flex-1 font-bold text-text-primary typo-footnote">
                  {folder.name}
                </span>
                <span className="text-text-tertiary tabular-nums typo-caption1">
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

const BriefingPreview = (): ReactElement => {
  const arrived = useTimeline([900]) >= 1;
  return (
    <Scene>
      <Row gone={!arrived} enter={arrived}>
        <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-secondary bg-surface-float p-3">
          <div className="flex items-center gap-2">
            <BriefIcon
              secondary
              size={IconSize.Size16}
              className="text-text-primary"
            />
            <span className="flex-1 font-bold text-text-primary typo-footnote">
              Your briefing is ready
            </span>
            <span className="text-text-tertiary typo-caption1">3 min read</span>
          </div>
          {[86, 72, 80].map((width, index) => (
            <div key={width} className="flex items-center gap-2">
              <span className="w-3 text-text-tertiary tabular-nums typo-caption2">
                {index + 1}
              </span>
              <Bar width={`${width}%`} />
            </div>
          ))}
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
    label: 'Ad-free',
    perk: 'Removes every ad',
    Icon: BlockIcon,
    Preview: AdFreePreview,
  },
  {
    id: 'clean-titles',
    label: 'Clean titles',
    perk: 'Rewrites clickbait titles',
    Icon: ShieldPlusIcon,
    Preview: CleanTitlesPreview,
  },
  {
    id: 'custom-feeds',
    label: 'Custom feeds',
    perk: 'Builds feeds you can query, like AI coding',
    Icon: HashtagIcon,
    Preview: CustomFeedsPreview,
  },
  {
    id: 'keywords',
    label: 'Keywords',
    perk: 'Hides posts with words you mute, like “Big AI”',
    Icon: LabelIcon,
    Preview: KeywordsPreview,
  },
  {
    id: 'folders',
    label: 'Folders',
    perk: 'Organizes bookmarks into folders',
    Icon: FolderIcon,
    Preview: FoldersPreview,
  },
  {
    id: 'briefing',
    label: 'Briefing',
    perk: 'Unlocks Presidential Briefing',
    Icon: BriefIcon,
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
                    <item.Icon secondary={active} size={IconSize.Size16} />
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
