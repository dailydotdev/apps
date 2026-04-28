import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  DragIcon,
  EditIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '../../../../components/icons';
import { apiUrl } from '../../../../lib/config';
import { getDomainFromUrl } from '../../../../lib/links';
import { MAX_SHORTCUTS } from '../../types';
import type { Shortcut } from '../../types';
import { SectionHeader } from './ShortcutsManageCommon';

function CapacityPill({
  used,
  max,
}: {
  used: number;
  max: number;
}): ReactElement {
  const remaining = max - used;
  let tone = 'bg-surface-float text-text-tertiary';

  if (used >= max) {
    tone = 'bg-overlay-float-ketchup text-accent-ketchup-default';
  } else if (remaining <= 2) {
    tone = 'bg-overlay-float-cabbage text-accent-cabbage-default';
  }

  return (
    <span
      className={classNames(
        'rounded-6 px-1.5 py-0.5 font-bold tabular-nums typo-caption1',
        tone,
      )}
    >
      {used}/{max}
    </span>
  );
}

function ShortcutRow({
  shortcut,
  onEdit,
  onRemove,
}: {
  shortcut: Shortcut;
  onEdit: (shortcut: Shortcut) => void;
  onRemove: (shortcut: Shortcut) => void;
}): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: shortcut.url });
  const label = shortcut.name || getDomainFromUrl(shortcut.url);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        'group relative flex items-center gap-3 rounded-10 p-2 transition-colors duration-150 hover:bg-surface-float motion-reduce:transition-none',
        isDragging &&
          'z-10 rotate-[-1deg] bg-surface-float shadow-2 motion-reduce:rotate-0',
      )}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${label}`}
        className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-6 text-text-quaternary transition-colors duration-150 hover:text-text-primary focus-visible:text-text-primary active:cursor-grabbing motion-reduce:transition-none"
        {...attributes}
        {...listeners}
      >
        <DragIcon />
      </button>
      <img
        src={`${apiUrl}/icon?url=${encodeURIComponent(shortcut.url)}&size=32`}
        alt=""
        className="size-8 shrink-0 rounded-8 bg-surface-float"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-text-primary typo-callout">{label}</p>
        <p className="truncate text-text-tertiary typo-caption1">
          {shortcut.url}
        </p>
      </div>
      <div className="[@media(hover:none)]:opacity-60 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:none)]:focus-within:opacity-100">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<EditIcon />}
          aria-label={`Edit ${label}`}
          onClick={() => onEdit(shortcut)}
        />
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<TrashIcon />}
          aria-label={`Remove ${label}`}
          onClick={() => onRemove(shortcut)}
          className="hover:!bg-overlay-float-ketchup hover:!text-accent-ketchup-default"
        />
      </div>
    </div>
  );
}

interface ManualShortcutsSectionProps {
  shortcuts: Shortcut[];
  canAdd: boolean;
  onAdd: () => void;
  onEdit: (shortcut: Shortcut) => void;
  onRemove: (shortcut: Shortcut) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function ManualShortcutsSection({
  shortcuts,
  canAdd,
  onAdd,
  onEdit,
  onRemove,
  onReorder,
}: ManualShortcutsSectionProps): ReactElement {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    onReorder(active.id as string, over.id as string);
  };

  return (
    <section className="flex flex-col gap-2">
      <SectionHeader
        title="Your shortcuts"
        description="Drag to reorder. Hover a row to edit or remove."
        trailing={<CapacityPill used={shortcuts.length} max={MAX_SHORTCUTS} />}
      />
      {shortcuts.length === 0 ? (
        <div className="bg-surface-float/40 flex flex-col items-center gap-3 rounded-14 border border-dashed border-border-subtlest-tertiary px-4 py-8 text-center">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-14 bg-overlay-float-cabbage text-accent-cabbage-default"
          >
            <StarIcon secondary className="size-6" />
          </span>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Your shortcuts, your rules
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Add one manually or import from Connections below.
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={onAdd}
            className="mt-1"
          >
            Add shortcut
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className="disabled:opacity-60 group flex items-center gap-3 rounded-10 p-2 text-left transition-colors duration-150 hover:bg-surface-float disabled:cursor-not-allowed disabled:hover:bg-transparent motion-reduce:transition-none"
            aria-label="Add a shortcut"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-8 border border-dashed border-border-subtlest-tertiary text-text-tertiary transition-all duration-150 group-hover:border-solid group-hover:border-accent-cabbage-default group-hover:bg-overlay-float-cabbage group-hover:text-accent-cabbage-default motion-reduce:transition-none">
              <PlusIcon />
            </span>
            <p className="truncate text-text-primary typo-callout">
              Add a shortcut
            </p>
            {!canAdd && (
              <span className="ml-auto text-text-tertiary typo-caption1">
                Library full
              </span>
            )}
          </button>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={shortcuts.map((shortcut) => shortcut.url)}
              strategy={verticalListSortingStrategy}
            >
              {shortcuts.map((shortcut) => (
                <ShortcutRow
                  key={shortcut.url}
                  shortcut={shortcut}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </section>
  );
}
