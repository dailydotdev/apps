import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import CloseButton from '../../components/CloseButton';
import Link from '../../components/utilities/Link';
import { IconSize } from '../../components/Icon';
import { ArrowIcon } from '../../components/icons/Arrow';
import { LockIcon } from '../../components/icons/Lock';
import { OpenLinkIcon } from '../../components/icons/OpenLink';
import { PlusIcon } from '../../components/icons/Plus';
import { SearchIcon } from '../../components/icons/Search';
import { TipIcon } from '../../components/icons/Tip';
import { VIcon } from '../../components/icons/V';
import { useAuthContext } from '../../contexts/AuthContext';
import { getLogContextStatic, useLogContext } from '../../contexts/LogContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import type { LogContextData } from '../../hooks/log/useLogContextData';
import { useIsPhoneNow, useViewSize, ViewSize } from '../../hooks/useViewSize';
import { marketplaceSubmitUrl } from '../../graphql/plugins';
import { LogEvent, TargetId } from '../../lib/log';
import { anchorDefaultRel } from '../../lib/strings';
import { useMessagesEnabled } from '../messages/hooks/useMessagesEnabled';
import type { FeedWidget, FeedWidgetConfig } from './types';
import {
  FeedWidgetKind,
  FeedWidgetSize,
  feedWidgetSizeLabel,
  feedWidgetSizeSpan,
} from './types';
import type {
  FeedWidgetAvailability,
  FeedWidgetDefinition,
  FeedWidgetTone,
} from './registry';
import {
  FeedWidgetCategory,
  FeedWidgetIcon,
  isFeedWidgetBare,
} from './registry';
import {
  availableFeedWidgets,
  feedWidgetSizesForScreen,
  getFeedWidgetComponent,
} from './components';
import { FeedWidgetSurface, useInertRef } from './FeedWidgetFrame';
import { RAIL_CELL_HEIGHT, RAIL_HEIGHT } from './FeedWidgetRailFrame';
import { FeedWidgetTip } from './widgets/FeedWidgetTip';
import type { FeedWidgetTip as FeedWidgetTipItem } from './tips';

const TIPS = 'tips';

type Selection = FeedWidgetKind | typeof TIPS;

const tipsName = 'daily.dev tips';
const tipsDescription =
  'One tip over the ad, to get more out of daily.dev, with what to do and a button that does it.';

const categories = Object.values(FeedWidgetCategory);

const sizeOrder = Object.keys(feedWidgetSizeSpan) as FeedWidgetSize[];

// The kinds worth a first look, best first; the gallery suggests the first
// few a reader can add and does not have yet.
const suggestedKinds: FeedWidgetKind[] = [
  FeedWidgetKind.Streak,
  FeedWidgetKind.Briefing,
  FeedWidgetKind.ReadingList,
  FeedWidgetKind.SquadUpdates,
  FeedWidgetKind.TopicalDigest,
  FeedWidgetKind.Weather,
  FeedWidgetKind.TodoList,
];

const SUGGESTED_COUNT = 3;

const toneClassName: Record<FeedWidgetTone, string> = {
  avocado: 'bg-accent-avocado-flat text-accent-avocado-default',
  bacon: 'bg-accent-bacon-flat text-accent-bacon-default',
  bun: 'bg-accent-bun-flat text-accent-bun-default',
  cabbage: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  cheese: 'bg-accent-cheese-flat text-accent-cheese-default',
  onion: 'bg-accent-onion-flat text-accent-onion-default',
  water: 'bg-accent-water-flat text-accent-water-default',
};

// The rail's column, on a four-column feed, and its gap.
const PREVIEW_COLUMN = '17.25rem';
const PREVIEW_COLUMN_GAP = '2rem';

const noop = (): void => undefined;

// A preview is not a placement: what its posts and tips would log on the rail
// would count impressions nobody saw in the feed.
const previewLog: LogContextData = {
  logEvent: noop,
  logEventStart: noop,
  logEventEnd: noop,
  sendBeacon: noop,
};

type GalleryItem = {
  definition: FeedWidgetDefinition;
  isOnRail: boolean;
  /** On the rail, and only one may be. */
  isAdded: boolean;
  disabledReason?: string;
};

export type FeedWidgetGalleryTips = {
  /** The tip the rail shows this page view. */
  tip: FeedWidgetTipItem;
  isShown: boolean;
  /** Set while the reader has removed the tips and can bring them back. */
  onRestore?: () => void;
};

const matchesQuery = (text: string, query: string): boolean =>
  text.toLowerCase().includes(query.trim().toLowerCase());

const orderSizes = (sizes: FeedWidgetSize[]): FeedWidgetSize[] =>
  sizeOrder.filter((size) => sizes.includes(size));

const TAB_STOPS = 'a[href], button:not([disabled]), input:not([disabled])';

/**
 * Tabs between the gallery's own controls. react-modal walks the links
 * itself in Safari, inert ones too, and would stall on a preview's.
 */
const tabPastPreviews = (event: KeyboardEvent<HTMLElement>): void => {
  if (event.key !== 'Tab') {
    return;
  }
  const stops = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(TAB_STOPS),
  ).filter((stop) => stop.tabIndex >= 0 && !stop.closest('[inert]'));
  const index = stops.indexOf(document.activeElement as HTMLElement);
  const step = event.shiftKey ? -1 : 1;
  const from = index === -1 && event.shiftKey ? stops.length : index;
  const next = stops[(from + step + stops.length) % stops.length];
  if (!next) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  next.focus();
};

const KindTile = ({
  tone,
  isLarge,
  children,
}: {
  tone: FeedWidgetTone;
  isLarge?: boolean;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center',
      isLarge ? 'size-10 rounded-12' : 'size-8 rounded-10',
      toneClassName[tone],
    )}
  >
    {children}
  </span>
);

const SelectionTile = ({
  selection,
  isLarge,
  definition,
}: {
  selection: Selection;
  isLarge?: boolean;
  definition?: FeedWidgetDefinition;
}): ReactElement => {
  const size = isLarge ? IconSize.Small : IconSize.Size16;

  return (
    <KindTile tone={definition?.tone ?? 'cabbage'} isLarge={isLarge}>
      {selection === TIPS ? (
        <TipIcon size={size} />
      ) : (
        <FeedWidgetIcon kind={selection} size={size} />
      )}
    </KindTile>
  );
};

const RowStatus = ({
  isOnRail,
  isLocked,
}: {
  isOnRail?: boolean;
  isLocked?: boolean;
}): ReactElement | null => {
  if (isLocked) {
    return (
      <LockIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-quaternary"
        aria-label="Needs something first"
      />
    );
  }
  if (isOnRail) {
    return (
      <VIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-tertiary"
        aria-label="On your rail"
      />
    );
  }
  return null;
};

/** The real widget, live and out of reach, scaled down to fit its stage. */
const FeedWidgetPreview = ({
  kind,
  size,
  className,
}: {
  kind: FeedWidgetKind;
  size: FeedWidgetSize;
  className?: string;
}): ReactElement | null => {
  const { squads } = useAuthContext();
  const stageRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const Component = getFeedWidgetComponent(kind);
  const { cols, rows } = feedWidgetSizeSpan[size];
  const width = `calc(${cols} * ${PREVIEW_COLUMN} + ${
    cols - 1
  } * ${PREVIEW_COLUMN_GAP})`;
  const height = rows === 1 ? RAIL_CELL_HEIGHT : RAIL_HEIGHT;
  // Squad updates shows a squad the reader is in, as it will once picked.
  const widget = useMemo<FeedWidget>(
    () => ({
      id: `preview-${kind}`,
      kind,
      size,
      ...(kind === FeedWidgetKind.SquadUpdates &&
        squads?.[0] && {
          config: { sourceId: squads[0].id } as FeedWidgetConfig,
        }),
    }),
    [kind, size, squads],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const node = widgetRef.current;
    if (!stage || !node) {
      return undefined;
    }

    const fit = () => {
      const { offsetWidth, offsetHeight } = node;
      if (!offsetWidth || !offsetHeight) {
        return;
      }
      setScale(
        Math.min(
          1,
          stage.clientWidth / offsetWidth,
          stage.clientHeight / offsetHeight,
        ),
      );
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [size]);

  if (!Component) {
    return null;
  }

  const PreviewLogContext = getLogContextStatic();

  return (
    <div
      ref={stageRef}
      className={classNames(
        'flex min-h-0 min-w-0 items-center justify-center',
        className,
      )}
    >
      <div
        className="shrink-0"
        style={{
          width: `calc(${width} * ${scale})`,
          height: `calc(${height} * ${scale})`,
        }}
      >
        <div
          ref={widgetRef}
          role="group"
          aria-label={`${feedWidgetSizeLabel[size]} preview`}
          className="flex origin-top-left"
          style={{ width, height, transform: `scale(${scale})` }}
        >
          <PreviewLogContext.Provider value={previewLog}>
            <FeedWidgetSurface isBare={isFeedWidgetBare(kind, size)} isInert>
              <Component
                widget={widget}
                size={size}
                isEditing={false}
                onConfigChange={() => false}
                canConfigure={false}
                isConfiguring={false}
                onConfigureEnd={noop}
              />
            </FeedWidgetSurface>
          </PreviewLogContext.Provider>
        </div>
      </div>
    </div>
  );
};

const TipsPreview = ({ tip }: { tip: FeedWidgetTipItem }): ReactElement => {
  const ref = useInertRef<HTMLDivElement>(true);
  const PreviewLogContext = getLogContextStatic();

  return (
    <div ref={ref} className="w-full max-w-[17.25rem]">
      <PreviewLogContext.Provider value={previewLog}>
        <FeedWidgetTip tip={tip} isEditing />
      </PreviewLogContext.Provider>
    </div>
  );
};

const radioKeySteps: Partial<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** Arrow keys move a size group's choice, and its focus, as radios do. */
const sizeFromKey = (
  event: KeyboardEvent<HTMLElement>,
  sizes: FeedWidgetSize[],
  size: FeedWidgetSize,
): FeedWidgetSize | undefined => {
  const step = radioKeySteps[event.key];
  if (!step) {
    return undefined;
  }
  event.preventDefault();
  const index = (sizes.indexOf(size) + step + sizes.length) % sizes.length;
  const radios =
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      '[role="radio"]',
    );
  radios?.[index]?.focus();
  return sizes[index];
};

const SizePicker = ({
  sizes,
  size,
  onChange,
}: {
  sizes: FeedWidgetSize[];
  size: FeedWidgetSize;
  onChange: (size: FeedWidgetSize) => void;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label="Size"
    className="flex rounded-10 bg-surface-float p-0.5"
  >
    {sizes.map((value) => (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={size === value}
        tabIndex={size === value ? 0 : -1}
        onClick={() => onChange(value)}
        onKeyDown={(event) => {
          const next = sizeFromKey(event, sizes, size);
          if (next) {
            onChange(next);
          }
        }}
        className={classNames(
          'h-7 rounded-8 px-3 transition-colors typo-footnote',
          size === value
            ? 'bg-background-default font-bold text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {feedWidgetSizeLabel[value]}
      </button>
    ))}
  </div>
);

const CreateOwnLink = (): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <a
      href={marketplaceSubmitUrl}
      target="_blank"
      rel={anchorDefaultRel}
      onClick={() =>
        logEvent({
          event_name: LogEvent.OpenMarketplace,
          target_id: TargetId.FeedWidgets,
        })
      }
      className="group/own flex items-center gap-2.5 rounded-12 p-2 transition-colors hover:bg-surface-hover"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 border border-dashed border-border-subtlest-secondary text-text-secondary">
        <PlusIcon size={IconSize.Size16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-text-primary typo-footnote">
          Create your own widget
        </span>
        <span className="truncate text-text-tertiary typo-caption1">
          Build one in the marketplace
        </span>
      </span>
      <OpenLinkIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-quaternary group-hover/own:text-text-primary"
      />
    </a>
  );
};

const SearchField = ({
  query,
  onChange,
  className,
}: {
  query: string;
  onChange: (query: string) => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex shrink-0 items-center gap-2 bg-surface-float focus-within:ring-2 focus-within:ring-accent-cabbage-default',
      className,
    )}
  >
    <SearchIcon size={IconSize.Size16} className="text-text-tertiary" />
    <input
      type="search"
      value={query}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search widgets"
      aria-label="Search widgets"
      className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-tertiary"
    />
  </div>
);

const NoMatch = ({ query }: { query: string }): ReactElement => (
  <span className="px-2 py-6 text-center text-text-tertiary typo-footnote">
    No widget matches “{query.trim()}”.
  </span>
);

type AddState = {
  message: string;
  isAttention?: boolean;
  action: ReactNode;
};

/** The one action for the selection, and the line that explains it. */
const addStateFor = ({
  item,
  size,
  isFull,
  isPhone,
  onAdd,
}: {
  item?: GalleryItem;
  size: FeedWidgetSize;
  isFull: boolean;
  isPhone: boolean;
  onAdd: () => void;
}): AddState | null => {
  if (!item) {
    return null;
  }
  const buttonSize = isPhone ? ButtonSize.Large : ButtonSize.Medium;
  const buttonClassName = isPhone ? 'w-full' : undefined;
  const { definition, isOnRail, isAdded, disabledReason } = item;

  if (isAdded) {
    return {
      message: 'Already on your rail.',
      action: (
        <Button
          variant={ButtonVariant.Float}
          size={buttonSize}
          className={buttonClassName}
          icon={<VIcon />}
          disabled
        >
          Added
        </Button>
      ),
    };
  }

  if (disabledReason) {
    const fix = definition.disabledFix;
    return {
      message: disabledReason,
      isAttention: true,
      action: fix && (
        <Link href={fix.href} passHref>
          <Button
            tag="a"
            href={fix.href}
            variant={ButtonVariant.Secondary}
            size={buttonSize}
            className={buttonClassName}
          >
            {fix.label}
          </Button>
        </Link>
      ),
    };
  }

  let message = `Adds a ${feedWidgetSizeLabel[size]} widget at the end of your rail.`;
  if (isFull) {
    message = 'Your rail is full. Remove a widget to make room for this one.';
  } else if (isOnRail) {
    message = 'On your rail. Each one you add is set up on its own.';
  }

  return {
    message,
    isAttention: isFull,
    action: (
      <Button
        variant={ButtonVariant.Primary}
        size={buttonSize}
        className={buttonClassName}
        disabled={isFull}
        onClick={onAdd}
      >
        {isOnRail ? 'Add another' : 'Add widget'}
      </Button>
    ),
  };
};

const tipsStateFor = ({
  tips,
  isPhone,
}: {
  tips: FeedWidgetGalleryTips;
  isPhone: boolean;
}): AddState => {
  const buttonSize = isPhone ? ButtonSize.Large : ButtonSize.Medium;
  const buttonClassName = isPhone ? 'w-full' : undefined;

  if (tips.isShown) {
    return {
      message: 'On, over the ad slot. Remove it from the rail in edit mode.',
      action: (
        <Button
          variant={ButtonVariant.Float}
          size={buttonSize}
          className={buttonClassName}
          icon={<VIcon />}
          disabled
        >
          On
        </Button>
      ),
    };
  }

  return {
    message: 'Shows over the ad slot again. Not a widget, so it takes no room.',
    action: tips.onRestore && (
      <Button
        variant={ButtonVariant.Primary}
        size={buttonSize}
        className={buttonClassName}
        onClick={tips.onRestore}
      >
        Show tips again
      </Button>
    ),
  };
};

const DesktopRow = ({
  selection,
  definition,
  name,
  isSelected,
  isOnRail,
  isLocked,
  onSelect,
}: {
  selection: Selection;
  definition?: FeedWidgetDefinition;
  name: string;
  isSelected: boolean;
  isOnRail?: boolean;
  isLocked?: boolean;
  onSelect: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-current={isSelected}
    onClick={onSelect}
    className={classNames(
      'flex h-11 w-full shrink-0 items-center gap-2.5 rounded-12 px-2 text-left transition-colors',
      isSelected ? 'bg-surface-float' : 'hover:bg-surface-hover',
    )}
  >
    <SelectionTile selection={selection} definition={definition} />
    <span
      className={classNames(
        'min-w-0 flex-1 truncate typo-callout',
        isSelected ? 'font-bold text-text-primary' : 'text-text-secondary',
      )}
    >
      {name}
    </span>
    <RowStatus isOnRail={isOnRail} isLocked={isLocked} />
  </button>
);

const PhoneRow = ({
  selection,
  definition,
  name,
  description,
  isOnRail,
  isLocked,
  onSelect,
}: {
  selection: Selection;
  definition?: FeedWidgetDefinition;
  name: string;
  description: string;
  isOnRail?: boolean;
  isLocked?: boolean;
  onSelect: () => void;
}): ReactElement => (
  <button
    type="button"
    data-selection={selection}
    onClick={onSelect}
    className="flex h-14 w-full shrink-0 items-center gap-3 rounded-12 px-2 text-left active:bg-surface-float"
  >
    <SelectionTile selection={selection} definition={definition} isLarge />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold text-text-primary typo-callout">
        {name}
      </span>
      <span className="truncate text-text-tertiary typo-caption1">
        {description}
      </span>
    </span>
    {isOnRail || isLocked ? (
      <RowStatus isOnRail={isOnRail} isLocked={isLocked} />
    ) : (
      <ArrowIcon
        size={IconSize.Size16}
        className="shrink-0 rotate-90 text-text-quaternary"
      />
    )}
  </button>
);

const SectionLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="px-2 pb-1 font-bold text-text-tertiary typo-caption1">
    {children}
  </span>
);

/** A phone's sizes as pages to swipe, with a dot for each under them. */
const SizePages = ({
  kind,
  sizes,
  size,
  onChange,
}: {
  kind: FeedWidgetKind;
  sizes: FeedWidgetSize[];
  size: FeedWidgetSize;
  onChange: (size: FeedWidgetSize) => void;
}): ReactElement => {
  const scroller = useRef<HTMLDivElement>(null);
  const page = Math.max(0, sizes.indexOf(size));

  const scrollToPage = (index: number, behavior: ScrollBehavior) => {
    const node = scroller.current;
    node?.scrollTo?.({ left: index * node.clientWidth, behavior });
  };

  useEffect(() => {
    scrollToPage(page, 'auto');
    // Only where the pages start; a swipe moves them on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const pickPage = (index: number) => {
    onChange(sizes[index]);
    scrollToPage(index, 'smooth');
  };

  return (
    <>
      <div
        ref={scroller}
        className="no-scrollbar flex min-h-40 shrink snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          const next = sizes[Math.round(scrollLeft / clientWidth)];
          if (next && next !== size) {
            onChange(next);
          }
        }}
      >
        {sizes.map((value) => (
          <div
            key={value}
            className="flex w-full shrink-0 snap-center flex-col items-center gap-3 px-6"
          >
            <FeedWidgetPreview
              kind={kind}
              size={value}
              className="w-full flex-[0_1_18rem]"
            />
            <span className="font-bold text-text-tertiary typo-caption1">
              {feedWidgetSizeLabel[value]}
            </span>
          </div>
        ))}
      </div>
      {sizes.length > 1 && (
        <div
          role="radiogroup"
          aria-label="Size"
          className="flex shrink-0 justify-center gap-1.5 py-3"
        >
          {sizes.map((value, index) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-label={feedWidgetSizeLabel[value]}
              aria-checked={value === size}
              tabIndex={value === size ? 0 : -1}
              onClick={() => pickPage(index)}
              onKeyDown={(event) => {
                const next = sizeFromKey(event, sizes, size);
                if (next) {
                  pickPage(sizes.indexOf(next));
                }
              }}
              className={classNames(
                'size-1.5 rounded-max',
                value === size ? 'bg-text-primary' : 'bg-surface-float',
              )}
            />
          ))}
        </div>
      )}
    </>
  );
};

/**
 * The widgets a reader can add, each shown live at the size they pick and
 * added in that size. On a phone, a sheet of rows that opens a widget's sizes
 * to swipe through.
 */
export const FeedWidgetGallery = ({
  widgets,
  isFull,
  initialSize,
  onAdd,
  tips,
  onRequestClose,
}: {
  widgets: FeedWidget[];
  /** At the most widgets a rail holds, so nothing more can be added. */
  isFull: boolean;
  /** The size each widget starts at when it supports it. */
  initialSize?: FeedWidgetSize;
  onAdd: (kind: FeedWidgetKind, size: FeedWidgetSize) => void;
  /** Set where the tips can show over our slot. */
  tips?: FeedWidgetGalleryTips;
  onRequestClose: () => void;
}): ReactElement => {
  const { user, squads } = useAuthContext();
  const { loadedSettings, optOutReadingStreak } = useSettingsContext();
  const { isEnabled: hasMessages } = useMessagesEnabled();
  const isPhone = useViewSize(ViewSize.MobileL);
  const isPhoneScreen = useIsPhoneNow();
  const availability: FeedWidgetAvailability = {
    isLoggedIn: !!user,
    hasSquads: !!squads?.length,
    isReadingStreakOn: !(loadedSettings && optOutReadingStreak),
    hasMessages,
  };
  const onRail = new Set(widgets.map(({ kind }) => kind));
  const items: GalleryItem[] = availableFeedWidgets(availability).map(
    (definition) => {
      const isOnRail = onRail.has(definition.kind);
      const isAdded = isOnRail && !definition.allowMultiple;
      return {
        definition,
        isOnRail,
        isAdded,
        disabledReason: isAdded
          ? undefined
          : definition.disabledReason?.(availability),
      };
    },
  );
  const itemFor = (kind: FeedWidgetKind) =>
    items.find(({ definition }) => definition.kind === kind);
  const suggested = suggestedKinds
    .map(itemFor)
    .filter(
      (item): item is GalleryItem =>
        !!item && !item.isOnRail && !item.disabledReason,
    )
    .slice(0, SUGGESTED_COUNT);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Selection>(
    () => (suggested[0] ?? items[0])?.definition.kind ?? TIPS,
  );
  // On a phone the list comes first; a widget opens from it.
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sizes, setSizes] = useState<
    Partial<Record<FeedWidgetKind, FeedWidgetSize>>
  >({});
  const backButton = useRef<HTMLButtonElement>(null);
  const phoneList = useRef<HTMLDivElement>(null);
  const wasDetailOpen = useRef(false);

  // Focus follows the swap: to Back on the way in, to the row on the way out.
  useEffect(() => {
    if (isDetailOpen) {
      backButton.current?.focus();
    } else if (wasDetailOpen.current) {
      phoneList.current
        ?.querySelector<HTMLElement>(`[data-selection="${selected}"]`)
        ?.focus();
    }
    wasDetailOpen.current = isDetailOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailOpen]);

  const isSearching = !!query.trim();
  const sizesFor = (kind: FeedWidgetKind) =>
    orderSizes(feedWidgetSizesForScreen(kind, isPhoneScreen));
  const sizeFor = (kind: FeedWidgetKind): FeedWidgetSize => {
    const kindSizes = feedWidgetSizesForScreen(kind, isPhoneScreen);
    const picked = sizes[kind];
    if (picked && kindSizes.includes(picked)) {
      return picked;
    }
    return initialSize && kindSizes.includes(initialSize)
      ? initialSize
      : kindSizes[0];
  };

  const selectedKind = selected === TIPS ? undefined : selected;
  const selectedItem = selectedKind ? itemFor(selectedKind) : undefined;
  const selectedSize = selectedKind ? sizeFor(selectedKind) : undefined;
  const addState = addStateFor({
    item: selectedItem,
    size: selectedSize ?? FeedWidgetSize.Small,
    isFull,
    isPhone,
    onAdd: () => selectedKind && onAdd(selectedKind, sizeFor(selectedKind)),
  });
  const footer =
    selected === TIPS && tips ? tipsStateFor({ tips, isPhone }) : addState;

  const matches = ({ definition }: GalleryItem) =>
    matchesQuery(
      `${definition.name} ${definition.description} ${definition.category}`,
      query,
    );
  const showTips =
    !!tips && matchesQuery(`${tipsName} ${tipsDescription}`, query);
  const sections = categories
    .map((category) => ({
      category,
      items: items.filter(
        (item) =>
          item.definition.category === category &&
          matches(item) &&
          (isPhone || isSearching || !suggested.includes(item)),
      ),
      hasTips: category === FeedWidgetCategory.DailyDev && showTips,
    }))
    .filter((section) => section.items.length || section.hasTips);
  const hasMatches = sections.length > 0;

  const select = (selection: Selection) => {
    setSelected(selection);
    setIsDetailOpen(true);
  };

  const onSizeChange = (kind: FeedWidgetKind, size: FeedWidgetSize) =>
    setSizes((current) => ({ ...current, [kind]: size }));

  const renderRow = (item: GalleryItem) => {
    const { definition } = item;
    const props = {
      selection: definition.kind,
      definition,
      name: definition.name,
      isOnRail: item.isOnRail,
      isLocked: !!item.disabledReason,
      onSelect: () => select(definition.kind),
    };

    return isPhone ? (
      <PhoneRow
        key={definition.kind}
        {...props}
        description={definition.description}
      />
    ) : (
      <DesktopRow
        key={definition.kind}
        {...props}
        isSelected={selected === definition.kind}
      />
    );
  };

  const renderTipsRow = () =>
    isPhone ? (
      <PhoneRow
        selection={TIPS}
        name={tipsName}
        description={tipsDescription}
        isOnRail={tips?.isShown}
        onSelect={() => select(TIPS)}
      />
    ) : (
      <DesktopRow
        selection={TIPS}
        name={tipsName}
        isSelected={selected === TIPS}
        isOnRail={tips?.isShown}
        onSelect={() => select(TIPS)}
      />
    );

  const list = (
    <>
      {!isPhone && !isSearching && suggested.length > 0 && (
        <section className="flex flex-col">
          <SectionLabel>Suggested for you</SectionLabel>
          {suggested.map(renderRow)}
        </section>
      )}
      {sections.map(({ category, items: sectionItems, hasTips }) => (
        <section key={category} className="flex flex-col">
          <SectionLabel>{category}</SectionLabel>
          {sectionItems.map(renderRow)}
          {hasTips && renderTipsRow()}
        </section>
      ))}
      {!hasMatches && <NoMatch query={query} />}
    </>
  );

  const definition = selectedItem?.definition;
  const name = definition?.name ?? tipsName;
  const description = definition?.description ?? tipsDescription;

  if (isPhone) {
    const isDetail = isDetailOpen && (!!selectedItem || selected === TIPS);

    return (
      <Modal
        isOpen
        kind={ModalKind.FlexibleCenter}
        size={ModalSize.Small}
        onRequestClose={onRequestClose}
        isDrawerOnMobile
        drawerProps={{
          'aria-label': 'Add a widget',
          title: isDetail ? (
            <Button
              ref={backButton}
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="-rotate-90" />}
              aria-label="Back to widgets"
              onClick={() => setIsDetailOpen(false)}
            />
          ) : (
            'Add a widget'
          ),
          className: { drawer: 'p-0' },
        }}
      >
        {isDetail ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="flex flex-col items-center gap-1 px-6 pt-2 text-center">
                <SelectionTile
                  selection={selected}
                  definition={definition}
                  isLarge
                />
                <span className="mt-1 font-bold text-text-primary typo-title3">
                  {name}
                </span>
                <span className="text-text-secondary typo-footnote">
                  {description}
                </span>
              </div>
              <div className="flex min-h-0 shrink flex-col pt-4">
                {selectedKind && selectedSize ? (
                  <SizePages
                    kind={selectedKind}
                    sizes={sizesFor(selectedKind)}
                    size={selectedSize}
                    onChange={(size) => onSizeChange(selectedKind, size)}
                  />
                ) : (
                  tips && (
                    <div className="flex justify-center px-6">
                      <TipsPreview tip={tips.tip} />
                    </div>
                  )
                )}
              </div>
            </div>
            {footer && (
              <div className="flex flex-col gap-3 px-4 pb-2 pt-3">
                <span
                  className={classNames(
                    'text-center typo-footnote',
                    footer.isAttention
                      ? 'text-text-secondary'
                      : 'text-text-tertiary',
                  )}
                >
                  {footer.message}
                </span>
                {footer.action}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            <SearchField
              query={query}
              onChange={setQuery}
              className="mx-4 mt-1 h-10 rounded-12 px-3"
            />
            <div ref={phoneList} className="flex flex-col gap-4 px-2">
              {list}
              <CreateOwnLink />
            </div>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.XLarge}
      onRequestClose={onRequestClose}
      contentLabel="Add a widget"
      className="overflow-hidden tablet:!h-[40rem] tablet:!w-[min(62rem,calc(100vw-2rem))]"
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className="flex min-h-0 w-full flex-1" onKeyDown={tabPastPreviews}>
        <aside className="flex w-[17rem] shrink-0 flex-col border-r border-border-subtlest-tertiary">
          <div className="flex flex-col gap-3 p-4">
            <h2 className="font-bold text-text-primary typo-title3">
              Add a widget
            </h2>
            <SearchField
              query={query}
              onChange={setQuery}
              className="h-9 rounded-10 px-2.5"
            />
          </div>
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
            {list}
          </div>
          <div className="border-t border-border-subtlest-tertiary p-3">
            <CreateOwnLink />
          </div>
        </aside>
        <section className="relative flex min-w-0 flex-1 flex-col">
          <CloseButton
            size={ButtonSize.Small}
            className="!absolute right-3 top-3 z-1"
            onClick={onRequestClose}
          />
          <div className="flex items-start gap-3 px-6 pb-4 pt-6">
            <SelectionTile
              selection={selected}
              definition={definition}
              isLarge
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-10">
              <span className="flex flex-wrap items-center gap-x-2">
                <span className="font-bold text-text-primary typo-title3">
                  {name}
                </span>
                <span className="rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption1">
                  {definition?.category ?? FeedWidgetCategory.DailyDev}
                </span>
              </span>
              <span className="text-text-secondary typo-callout">
                {description}
              </span>
            </span>
          </div>
          {selectedKind &&
            selectedSize &&
            sizesFor(selectedKind).length > 1 && (
              <div className="flex justify-center pb-4">
                <SizePicker
                  sizes={sizesFor(selectedKind)}
                  size={selectedSize}
                  onChange={(size) => onSizeChange(selectedKind, size)}
                />
              </div>
            )}
          <div className="mx-6 flex min-h-0 flex-1 flex-col items-center justify-center rounded-20 bg-background-subtle p-6">
            {selectedKind && selectedSize ? (
              <FeedWidgetPreview
                key={selectedKind}
                kind={selectedKind}
                size={selectedSize}
                className="w-full flex-1"
              />
            ) : (
              tips && <TipsPreview tip={tips.tip} />
            )}
          </div>
          {footer && (
            <div className="flex items-center gap-4 border-t border-border-subtlest-tertiary px-6 py-4">
              <span
                className={classNames(
                  'min-w-0 flex-1 typo-footnote',
                  footer.isAttention
                    ? 'text-text-secondary'
                    : 'text-text-tertiary',
                )}
              >
                {footer.message}
              </span>
              {footer.action}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
};
