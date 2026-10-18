import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import type { ArrowLook } from './kit';
import {
  JoinButton,
  usePreview,
  MemberStack,
  PromotedLabel,
  SquadAvatar,
  membersLabel,
} from './kit';
import type { Slot } from './parts';
import { withPromoted } from './parts';
import { featuredSquads } from './data';
import type { DiscoverSquad } from './data';

// The Featured area: a Wolt-style mosaic on tablet and up, a Google Play
// banner rail on phones. Same data and promoted slot (second) on both, and
// every card joins in place.

const featuredSlots = (): Slot[] =>
  withPromoted(featuredSquads, 'featured').slice(0, 10);

/* ------------------------------------------------------------ helpers */

/**
 * A snap rail that knows whether it can still move each way, so the big
 * arrows only show where there is somewhere to go.
 */
const useRail = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // One step is an item plus the gap; a page is as many whole items as fit.
  const measure = () => {
    const node = ref.current;
    const first = node?.firstElementChild as HTMLElement | null;
    if (!node || !first) {
      return null;
    }
    const style = getComputedStyle(node);
    const gap = parseFloat(style.columnGap) || 0;
    const step = first.offsetWidth + gap;
    const inner =
      node.clientWidth -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    return {
      node,
      step,
      perPage: Math.max(1, Math.floor((inner + gap) / step)),
    };
  };

  const update = useCallback(() => {
    const metrics = measure();
    if (!metrics) {
      return;
    }
    const { node } = metrics;
    // Snap padding can leave a rail a few pixels off either end.
    const slack = 32;
    setEdges({
      start: node.scrollLeft <= slack,
      end: node.scrollLeft + node.clientWidth >= node.scrollWidth - slack,
    });
  }, []);
  useEffect(update, [update]);

  /** Slides a page of whole items. */
  const scroll = (direction: 1 | -1) => {
    const metrics = measure();
    metrics?.node.scrollBy({
      left: direction * metrics.perPage * metrics.step,
      behavior: 'smooth',
    });
  };
  return { ref, scroll, onScroll: update, ...edges };
};

const AUTO_ADVANCE_MS = 5000;

/**
 * Slides the rail on its own every five seconds, back to the start after
 * the last item. It holds while the pointer or focus is on the section,
 * stops for good once the reader swipes, scrolls or uses the arrows, and
 * never runs with reduced motion or in a hidden tab.
 */
const useAutoAdvance = (
  rail: ReturnType<typeof useRail>,
  section: React.RefObject<HTMLElement>,
) => {
  const held = useRef(false);
  const stopped = useRef(false);
  // The latest rail, so the timer never calls a stale scroll.
  const latestRail = useRef(rail);
  latestRail.current = rail;
  const stop = useCallback(() => {
    stopped.current = true;
  }, []);

  const { autoAdvance = true } = usePreview();

  useEffect(() => {
    const node = section.current;
    const scroller = latestRail.current.ref.current;
    const view = node?.ownerDocument.defaultView;
    if (!node || !scroller || !view || !autoAdvance) {
      return undefined;
    }
    if (view.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const hold = () => {
      held.current = true;
    };
    const release = () => {
      held.current = false;
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!node.contains(event.relatedTarget as Node | null)) {
        release();
      }
    };
    node.addEventListener('mouseenter', hold);
    node.addEventListener('mouseleave', release);
    node.addEventListener('focusin', hold);
    node.addEventListener('focusout', onFocusOut);
    scroller.addEventListener('pointerdown', stop);
    scroller.addEventListener('wheel', stop, { passive: true });
    scroller.addEventListener('touchstart', stop, { passive: true });

    const timer = view.setInterval(() => {
      if (
        stopped.current ||
        held.current ||
        node.ownerDocument.hidden ||
        // The other variant of the area, hidden at this width.
        !node.offsetParent
      ) {
        return;
      }
      const atEnd =
        scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 32;
      if (atEnd) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      latestRail.current.scroll(1);
    }, AUTO_ADVANCE_MS);

    return () => {
      view.clearInterval(timer);
      node.removeEventListener('mouseenter', hold);
      node.removeEventListener('mouseleave', release);
      node.removeEventListener('focusin', hold);
      node.removeEventListener('focusout', onFocusOut);
      scroller.removeEventListener('pointerdown', stop);
      scroller.removeEventListener('wheel', stop);
      scroller.removeEventListener('touchstart', stop);
    };
  }, [section, stop, autoAdvance]);

  return { stop };
};

/**
 * The arrow looks compared in Details. A, the Float square, is the chosen
 * one: the header's own button size, with a blur so it holds over images.
 * The first is how the arrows looked before it.
 */
export const arrowLooks: Record<
  ArrowLook,
  {
    label: string;
    note: string;
    variant: ButtonVariant;
    size: ButtonSize;
    className: string;
  }
> = {
  primary: {
    label: 'Before · Primary circle',
    note: 'White on every banner: the loudest thing on the page.',
    variant: ButtonVariant.Primary,
    size: ButtonSize.Large,
    className: '!size-12 !rounded-full shadow-2',
  },
  'float-square': {
    label: 'A · Square, Float (chosen)',
    note: 'Float at the header buttons’ size, blurred so it holds over images, and inset to the header’s edges: the left arrow lines up with search, the right one with New Squad.',
    variant: ButtonVariant.Float,
    size: ButtonSize.Small,
    className: 'backdrop-blur-[1.25rem] shadow-2',
  },
  glass: {
    label: 'B · Glass circle',
    note: 'The phone shell’s glass (shell-material): dark, blurred, a hairline edge.',
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
    className:
      'shell-material shell-press !size-12 !rounded-full !text-text-primary',
  },
  'quiet-square': {
    label: 'C · Quiet square',
    note: 'Subtle outline on the page background: present, never bright.',
    variant: ButtonVariant.Subtle,
    size: ButtonSize.Large,
    className: '!size-12 !bg-background-default shadow-2',
  },
  brand: {
    label: 'D · Brand tint',
    note: 'A cabbage-tinted circle: colour without the white glare.',
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Large,
    className:
      '!size-12 !rounded-full border border-accent-cabbage-subtler !bg-accent-cabbage-flat !text-accent-cabbage-default backdrop-blur-[1.25rem] shadow-2',
  },
};

/**
 * Arrows on the content's left and right edges, in the look picked above,
 * inset to the same edges as the header row above them. Laptop and up:
 * phones and tablets swipe.
 */
const BigArrows = ({
  onPrevious,
  onNext,
  canPrevious = true,
  canNext = true,
  className = 'top-1/2',
}: {
  onPrevious: () => void;
  onNext: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
  /** Vertical anchor, for rails whose image is not the full height. */
  className?: string;
}): ReactElement => {
  const { arrowLook = 'float-square' } = usePreview();
  const look = arrowLooks[arrowLook];
  const arrow = (side: 'left' | 'right') => (
    <Button
      type="button"
      size={look.size}
      variant={look.variant}
      icon={
        <ArrowIcon
          className={side === 'left' ? '-rotate-90' : 'rotate-90'}
          size={IconSize.Medium}
        />
      }
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      onClick={side === 'left' ? onPrevious : onNext}
      className={classNames(
        'absolute z-2 hidden -translate-y-1/2 laptop:flex',
        look.className,
        // On the header's edges: under search on the left, New Squad on the right.
        side === 'left' ? 'left-0' : 'right-0',
        className,
      )}
    />
  );
  return (
    <>
      {canPrevious && arrow('left')}
      {canNext && arrow('right')}
    </>
  );
};

const railClass =
  'no-scrollbar sd-scroll-snap -mx-4 flex gap-3 overflow-x-auto scroll-smooth px-4 laptop:-mx-6 laptop:gap-4 laptop:px-6';

/** "Featured" or "Promoted", the small caps line editorial cards lead with. */
const Eyebrow = ({ promoted }: { promoted: boolean }): ReactElement => (
  <Typography
    type={TypographyType.Caption1}
    color={TypographyColor.Secondary}
    bold
    className="uppercase tracking-wider"
  >
    {promoted ? 'Promoted' : 'Featured'}
  </Typography>
);

const NameLine = ({
  squad,
  type,
  className,
}: {
  squad: DiscoverSquad;
  type: TypographyType;
  className?: string;
}): ReactElement => (
  // `shrink` on both: the app's base styles set flex-shrink to 0.
  <span
    className={classNames(
      'flex min-w-0 shrink items-center gap-1.5',
      className,
    )}
  >
    <Typography
      tag={TypographyTag.H3}
      type={type}
      bold
      // Big names wrap to two lines rather than lose their end.
      truncate={type === TypographyType.Callout || type === TypographyType.Body}
      className={classNames(
        'min-w-0 shrink',
        type !== TypographyType.Callout &&
          type !== TypographyType.Body &&
          'line-clamp-2 break-words',
      )}
    >
      {squad.name}
    </Typography>
    {squad.verified && <VerifiedSquadBadge className="size-5 shrink-0" />}
  </span>
);

const OpenLink = ({ squad }: { squad: DiscoverSquad }): ReactElement => (
  <a
    href={squad.permalink}
    aria-label={`Open ${squad.name}`}
    className="absolute inset-0 z-0"
    onClick={(event) => event.preventDefault()}
  />
);

/**
 * A card that is all banner, with the words laid over its foot on a scrim
 * of the page colour, so it reads in both themes. Large is the mosaic's
 * lead tile, small its four (or two) companions.
 */
export const ImageCard = ({
  slot: { squad, promoted },
  size,
  className,
}: {
  slot: Slot;
  size: 'large' | 'small';
  className?: string;
}): ReactElement => {
  const isSmall = size === 'small';
  return (
    <article
      className={classNames(
        'relative isolate flex shrink-0 flex-col justify-end overflow-hidden rounded-24 bg-background-subtle',
        className,
      )}
    >
      <OpenLink squad={squad} />
      <img
        src={squad.banner}
        alt=""
        className="absolute inset-0 -z-1 size-full object-cover"
      />
      <span className="sd-scrim absolute inset-0 -z-1" />
      <div
        className={classNames(
          'pointer-events-none relative flex flex-col',
          // One bottom inset for both sizes, so Join lines up across a block.
          isSmall ? 'gap-1 p-3 pb-4' : 'gap-2 p-5 pb-4 laptop:p-6 laptop:pb-4',
        )}
      >
        {!isSmall && <Eyebrow promoted={promoted} />}
        <span className="flex items-center gap-3">
          <SquadAvatar
            squad={squad}
            className={classNames(
              'ring-2 ring-background-default',
              isSmall ? 'size-8' : 'size-12',
            )}
          />
          <NameLine
            squad={squad}
            type={isSmall ? TypographyType.Callout : TypographyType.Title2}
          />
        </span>
        {!isSmall && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="line-clamp-2 max-w-[36rem]"
          >
            {squad.description}
          </Typography>
        )}
        <span className="pointer-events-auto mt-1 flex items-center justify-between gap-3">
          {isSmall ? (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
              bold
              truncate
            >
              {promoted ? <PromotedLabel /> : membersLabel(squad.membersCount)}
            </Typography>
          ) : (
            <MemberStack squad={squad} />
          )}
          <JoinButton squad={squad} size={ButtonSize.Small} />
        </span>
      </div>
    </article>
  );
};

/* -------------------------------------------- phones: Banners (Google Play) */

/**
 * Google Play's "Featured" rail: wide 16:9 banners, the app's icon, name
 * and one meta line under each, Join on the right. Two and a half on a
 * laptop, one and a bit on a phone.
 */
const Banners = (): ReactElement => {
  const slots = featuredSlots();
  const rail = useRail();
  const { ref, scroll, onScroll, start, end } = rail;
  const section = useRef<HTMLElement>(null);
  const { stop } = useAutoAdvance(rail, section);
  return (
    <section ref={section} aria-label="Featured" className="relative">
      <div ref={ref} onScroll={onScroll} className={railClass}>
        {slots.map(({ squad, promoted }) => (
          <article
            key={squad.id}
            className="relative flex w-[85%] shrink-0 flex-col gap-3 tablet:w-[26rem] laptopL:w-[30rem]"
          >
            <OpenLink squad={squad} />
            <img
              src={squad.banner}
              alt=""
              className={classNames(
                'aspect-video w-full rounded-24 bg-background-subtle object-cover',
              )}
            />
            <span className="flex items-center gap-3">
              <SquadAvatar squad={squad} className="size-12" />
              <span className="flex min-w-0 flex-1 flex-col">
                <NameLine squad={squad} type={TypographyType.Body} />
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  {promoted && (
                    <>
                      <PromotedLabel />
                      <Separator />
                    </>
                  )}
                  {membersLabel(squad.membersCount)}
                  <Separator />
                  {squad.description}
                </Typography>
              </span>
              <JoinButton squad={squad} />
            </span>
          </article>
        ))}
      </div>
      {/* Centred on the banners, not on the banners plus their captions. */}
      <BigArrows
        onPrevious={() => {
          stop();
          scroll(-1);
        }}
        onNext={() => {
          stop();
          scroll(1);
        }}
        canPrevious={!start}
        canNext={!end}
        className="top-[calc((100%-4.5rem)/2)]"
      />
    </section>
  );
};

/* --------------------------------------- tablet and up: Bento (Wolt) */

/** laptopL: four small tiles beside the big one from here, two below. */
const WIDE_MOSAIC_QUERY = '(min-width: 1360px)';

/**
 * Whether the window the rail renders in (a device frame here) is at
 * laptopL or wider. Read from the node's own window, not the global one.
 */
const useWideMosaic = (ref: React.RefObject<HTMLElement>): boolean => {
  const [wide, setWide] = useState(false);
  useLayoutEffect(() => {
    const view = ref.current?.ownerDocument.defaultView;
    if (!view) {
      return undefined;
    }
    const query = view.matchMedia(WIDE_MOSAIC_QUERY);
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [ref]);
  return wide;
};

/**
 * Wolt's discovery mosaic: one big pick beside smaller ones in a block,
 * every tile image-first with the name on it. From laptopL a block holds
 * four small tiles in two columns; below it, two stacked in one column, so
 * names keep their room on a small laptop. The squads regroup rather than
 * hide, so every featured squad still has a place. The blocks are a
 * little narrower than the page, so the next block peeks, fading out. The
 * rail opens on the first block, flush left with only the right arrow; past
 * it the previous block peeks on the left too. The arrows slide one block. Phones get Banners' rail instead: a mosaic is too small
 * there.
 */
export const FeaturedMosaic = (): ReactElement => {
  const slots = withPromoted(featuredSquads, 'featured');
  const rail = useRail();
  const wide = useWideMosaic(rail.ref);
  const section = useRef<HTMLElement>(null);
  const { stop } = useAutoAdvance(rail, section);
  const blockSize = wide ? 5 : 3;
  const count = Math.ceil(slots.length / blockSize);
  const blockAt = (block: number) =>
    Array.from(
      { length: blockSize },
      (_, offset) => slots[(block * blockSize + offset) % slots.length],
    );
  const order = Array.from({ length: count }, (_, i) => i);

  const { featuredAt = 'first' } = usePreview();
  useLayoutEffect(() => {
    const node = rail.ref.current;
    const target = {
      first: 0,
      middle: Math.floor(count / 2),
      last: count - 1,
    }[featuredAt];
    const block = node?.children[target] as HTMLElement | undefined;
    node?.scrollTo({
      left: block
        ? block.offsetLeft - (node.clientWidth - block.offsetWidth) / 2
        : 0,
      behavior: 'instant' as ScrollBehavior,
    });
    rail.onScroll();
    // Back to the opening block whenever the blocks regroup at laptopL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockSize, featuredAt]);

  return (
    <>
      <section
        ref={section}
        aria-label="Featured"
        className="relative hidden tablet:block"
      >
        <div
          ref={rail.ref}
          onScroll={rail.onScroll}
          className={classNames(
            'no-scrollbar sd-fade-edges relative -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 laptop:-mx-6 laptop:gap-4 laptop:px-6 laptop:[--sd-fade:5rem]',
            rail.start && 'sd-at-start',
            rail.end && 'sd-at-end',
          )}
        >
          {order.map((block) => {
            const [big, ...small] = blockAt(block);
            return (
              <div
                key={`${blockSize}-${block}`}
                className={classNames(
                  'grid w-[calc(100%-3rem)] shrink-0 snap-center grid-rows-2 gap-3 tablet:h-[24rem] laptop:h-[26rem] laptop:w-[calc(100%-7rem)] laptop:gap-4',
                  wide ? 'grid-cols-4' : 'grid-cols-3',
                )}
              >
                <ImageCard
                  slot={big}
                  size="large"
                  className="col-span-2 row-span-2"
                />
                {small.map((slot) => (
                  <ImageCard key={slot.squad.id} slot={slot} size="small" />
                ))}
              </div>
            );
          })}
        </div>
        <BigArrows
          onPrevious={() => {
            stop();
            rail.scroll(-1);
          }}
          onNext={() => {
            stop();
            rail.scroll(1);
          }}
          canPrevious={!rail.start}
          canNext={!rail.end}
        />
      </section>
      <div className="tablet:hidden">
        <Banners />
      </div>
    </>
  );
};
