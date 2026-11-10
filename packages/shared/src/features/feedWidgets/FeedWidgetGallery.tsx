import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import CloseButton from '../../components/CloseButton';
import Link from '../../components/utilities/Link';
import { IconSize } from '../../components/Icon';
import { LockIcon } from '../../components/icons/Lock';
import { TipIcon } from '../../components/icons/Tip';
import { VIcon } from '../../components/icons/V';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useMessagesEnabled } from '../messages/hooks/useMessagesEnabled';
import { useLiveChatEnabled } from '../liveChat/hooks/useLiveChatEnabled';
import type { FeedWidget } from './types';
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
import { FeedWidgetCategory, FeedWidgetIcon } from './registry';
import { availableFeedWidgets, feedWidgetSizes } from './components';
import { FeedWidgetPreview, TipsPreview } from './FeedWidgetPreview';
import { SizePicker } from './FeedWidgetSizePicker';
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
        role="img"
        aria-label="Needs something first"
      />
    );
  }
  if (isOnRail) {
    return (
      <VIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-tertiary"
        role="img"
        aria-label="On your rail"
      />
    );
  }
  return null;
};

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
  onAdd,
}: {
  item?: GalleryItem;
  size: FeedWidgetSize;
  isFull: boolean;
  onAdd: () => void;
}): AddState | null => {
  if (!item) {
    return null;
  }
  const { definition, isOnRail, isAdded, disabledReason } = item;

  if (isAdded) {
    return {
      message: 'Already on your rail.',
      action: (
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
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
            size={ButtonSize.Medium}
          >
            {fix.label}
          </Button>
        </Link>
      ),
    };
  }

  let message = `Adds a ${feedWidgetSizeLabel[
    size
  ].toLowerCase()} widget at the end of your rail.`;
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
        size={ButtonSize.Medium}
        disabled={isFull}
        onClick={onAdd}
      >
        {isOnRail ? 'Add another' : 'Add widget'}
      </Button>
    ),
  };
};

const tipsStateFor = (tips: FeedWidgetGalleryTips): AddState => {
  if (tips.isShown) {
    return {
      message: 'On, over the ad slot. Remove it from the rail in edit mode.',
      action: (
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
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
        size={ButtonSize.Medium}
        onClick={tips.onRestore}
      >
        Show tips again
      </Button>
    ),
  };
};

const GalleryRow = ({
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

const SectionLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="px-2 pb-1 font-bold text-text-tertiary typo-caption1">
    {children}
  </span>
);

/**
 * The widgets a reader can add, each shown live at the size they pick and
 * added in that size.
 */
export const FeedWidgetGallery = ({
  widgets,
  isFull,
  initialKind,
  initialSize,
  onAdd,
  tips,
  onRequestClose,
}: {
  widgets: FeedWidget[];
  /** At the most widgets a rail holds, so nothing more can be added. */
  isFull: boolean;
  /** The widget it opens on, instead of the first suggestion. */
  initialKind?: FeedWidgetKind;
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
  const { isEnabled: hasLiveChat } = useLiveChatEnabled();
  const availability: FeedWidgetAvailability = {
    isLoggedIn: !!user,
    hasSquads: !!squads?.length,
    isReadingStreakOn: !(loadedSettings && optOutReadingStreak),
    hasMessages,
    hasLiveChat,
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

  const [selected, setSelected] = useState<Selection>(
    () =>
      ((initialKind && itemFor(initialKind)) ?? suggested[0] ?? items[0])
        ?.definition.kind ?? TIPS,
  );
  const [sizes, setSizes] = useState<
    Partial<Record<FeedWidgetKind, FeedWidgetSize>>
  >({});

  const sizesFor = (kind: FeedWidgetKind) => orderSizes(feedWidgetSizes(kind));
  const sizeFor = (kind: FeedWidgetKind): FeedWidgetSize => {
    const kindSizes = feedWidgetSizes(kind);
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
    onAdd: () => selectedKind && onAdd(selectedKind, sizeFor(selectedKind)),
  });
  const footer = selected === TIPS && tips ? tipsStateFor(tips) : addState;

  const sections = categories
    .map((category) => ({
      category,
      items: items.filter(
        (item) =>
          item.definition.category === category && !suggested.includes(item),
      ),
      hasTips: category === FeedWidgetCategory.DailyDev && !!tips,
    }))
    .filter((section) => section.items.length || section.hasTips);

  const select = (selection: Selection) => setSelected(selection);

  const onSizeChange = (kind: FeedWidgetKind, size: FeedWidgetSize) =>
    setSizes((current) => ({ ...current, [kind]: size }));

  const renderRow = (item: GalleryItem) => {
    const { definition } = item;

    return (
      <GalleryRow
        key={definition.kind}
        selection={definition.kind}
        definition={definition}
        name={definition.name}
        isSelected={selected === definition.kind}
        isOnRail={item.isOnRail}
        isLocked={!!item.disabledReason}
        onSelect={() => select(definition.kind)}
      />
    );
  };

  const renderTipsRow = () => (
    <GalleryRow
      selection={TIPS}
      name={tipsName}
      isSelected={selected === TIPS}
      isOnRail={tips?.isShown}
      onSelect={() => select(TIPS)}
    />
  );

  const list = (
    <>
      {suggested.length > 0 && (
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
    </>
  );

  const definition = selectedItem?.definition;
  const name = definition?.name ?? tipsName;
  const description = definition?.description ?? tipsDescription;

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
          <h2 className="p-4 font-bold text-text-primary typo-title3">
            Add a widget
          </h2>
          <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
            {list}
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
