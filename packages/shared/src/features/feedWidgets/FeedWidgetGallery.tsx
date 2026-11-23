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
import { VIcon } from '../../components/icons/V';
import type { FeedWidget, FeedWidgetSize } from './types';
import { FeedWidgetKind, feedWidgetSizeSpan } from './types';
import type { FeedWidgetDefinition, FeedWidgetTone } from './registry';
import { FeedWidgetCategory, FeedWidgetIcon } from './registry';
import { availableFeedWidgets, feedWidgetSizes } from './components';
import { useFeedWidgetAvailability } from './availability';
import { FeedWidgetPreview } from './FeedWidgetPreview';
import { SizePicker } from './FeedWidgetSizePicker';

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
  isLarge,
  definition,
}: {
  isLarge?: boolean;
  definition: FeedWidgetDefinition;
}): ReactElement => (
  <KindTile tone={definition.tone} isLarge={isLarge}>
    <FeedWidgetIcon
      kind={definition.kind}
      size={isLarge ? IconSize.Small : IconSize.Size16}
    />
  </KindTile>
);

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
        aria-label="In your feed"
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
  isFull,
  onAdd,
}: {
  item?: GalleryItem;
  isFull: boolean;
  onAdd: () => void;
}): AddState | null => {
  if (!item) {
    return null;
  }
  const { definition, isOnRail, isAdded, disabledReason } = item;

  if (isAdded) {
    return {
      message: 'Already in your feed.',
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

  let message = 'Takes the place of the card you picked.';
  if (isFull) {
    message = 'Your feed has all the widgets it can hold. Remove one first.';
  } else if (isOnRail) {
    message = 'In your feed. Each one you add is set up on its own.';
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

const GalleryRow = ({
  definition,
  isSelected,
  isOnRail,
  isLocked,
  onSelect,
}: {
  definition: FeedWidgetDefinition;
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
    <SelectionTile definition={definition} />
    <span
      className={classNames(
        'min-w-0 flex-1 truncate typo-callout',
        isSelected ? 'font-bold text-text-primary' : 'text-text-secondary',
      )}
    >
      {definition.name}
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
  allowedSizes,
  sizeLabel,
  onAdd,
  onRequestClose,
}: {
  widgets: FeedWidget[];
  /** At the most widgets a rail holds, so nothing more can be added. */
  isFull: boolean;
  /** The widget it opens on, instead of the first suggestion. */
  initialKind?: FeedWidgetKind;
  /** The size each widget starts at when it supports it. */
  initialSize?: FeedWidgetSize;
  /** The sizes this surface has room for, every kind's own by default. */
  allowedSizes?: FeedWidgetSize[];
  /** What this surface calls each size. */
  sizeLabel?: (size: FeedWidgetSize) => string;
  onAdd: (kind: FeedWidgetKind, size: FeedWidgetSize) => void;
  onRequestClose: () => void;
}): ReactElement => {
  const availability = useFeedWidgetAvailability();
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

  const [selected, setSelected] = useState<FeedWidgetKind | undefined>(
    () =>
      ((initialKind && itemFor(initialKind)) ?? suggested[0] ?? items[0])
        ?.definition.kind,
  );
  const [sizes, setSizes] = useState<
    Partial<Record<FeedWidgetKind, FeedWidgetSize>>
  >({});

  const sizesFor = (kind: FeedWidgetKind) =>
    orderSizes(feedWidgetSizes(kind)).filter(
      (size) => !allowedSizes || allowedSizes.includes(size),
    );
  const sizeFor = (kind: FeedWidgetKind): FeedWidgetSize => {
    const kindSizes = allowedSizes ? sizesFor(kind) : feedWidgetSizes(kind);
    const picked = sizes[kind];
    if (picked && kindSizes.includes(picked)) {
      return picked;
    }
    return initialSize && kindSizes.includes(initialSize)
      ? initialSize
      : kindSizes[0];
  };

  const selectedKind = selected;
  const selectedItem = selectedKind ? itemFor(selectedKind) : undefined;
  const selectedSize = selectedKind ? sizeFor(selectedKind) : undefined;
  const addState = addStateFor({
    item: selectedItem,
    isFull,
    onAdd: () => selectedKind && onAdd(selectedKind, sizeFor(selectedKind)),
  });
  const footer = addState;

  const sections = categories
    .map((category) => ({
      category,
      items: items.filter(
        (item) =>
          item.definition.category === category && !suggested.includes(item),
      ),
    }))
    .filter((section) => section.items.length);

  const select = (kind: FeedWidgetKind) => setSelected(kind);

  const onSizeChange = (kind: FeedWidgetKind, size: FeedWidgetSize) =>
    setSizes((current) => ({ ...current, [kind]: size }));

  const renderRow = (item: GalleryItem) => {
    const { definition } = item;

    return (
      <GalleryRow
        key={definition.kind}
        definition={definition}
        isSelected={selected === definition.kind}
        isOnRail={item.isOnRail}
        isLocked={!!item.disabledReason}
        onSelect={() => select(definition.kind)}
      />
    );
  };

  const list = (
    <>
      {suggested.length > 0 && (
        <section className="flex flex-col">
          <SectionLabel>Suggested for you</SectionLabel>
          {suggested.map(renderRow)}
        </section>
      )}
      {sections.map(({ category, items: sectionItems }) => (
        <section key={category} className="flex flex-col">
          <SectionLabel>{category}</SectionLabel>
          {sectionItems.map(renderRow)}
        </section>
      ))}
    </>
  );

  const definition = selectedItem?.definition;

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
          {definition && (
            <div className="flex items-start gap-3 px-6 pb-4 pt-6">
              <SelectionTile definition={definition} isLarge />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-10">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="font-bold text-text-primary typo-title3">
                    {definition.name}
                  </span>
                  <span className="rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption1">
                    {definition.category}
                  </span>
                </span>
                <span className="text-text-secondary typo-callout">
                  {definition.description}
                </span>
              </span>
            </div>
          )}
          {selectedKind &&
            selectedSize &&
            sizesFor(selectedKind).length > 1 && (
              <div className="flex justify-center pb-4">
                <SizePicker
                  sizes={sizesFor(selectedKind)}
                  size={selectedSize}
                  label={sizeLabel}
                  onChange={(size) => onSizeChange(selectedKind, size)}
                />
              </div>
            )}
          <div className="mx-6 flex min-h-0 flex-1 flex-col items-center justify-center rounded-20 bg-background-subtle p-6">
            {selectedKind && selectedSize && (
              <FeedWidgetPreview
                key={selectedKind}
                kind={selectedKind}
                size={selectedSize}
                className="w-full flex-1"
              />
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
