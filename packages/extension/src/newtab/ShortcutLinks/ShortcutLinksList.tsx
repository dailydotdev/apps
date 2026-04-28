import type { ReactElement } from 'react';
import React from 'react';
import {
  ClearIcon,
  EyeIcon,
  MenuIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { MenuIcon as WrappingMenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import classNames from 'classnames';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useDragClickGuard,
  DRAG_ACTIVATION_DISTANCE_PX,
} from '@dailydotdev/shared/src/features/shortcuts/hooks/useDragClickGuard';
import {
  ShortcutLinksItem,
  ShortcutItemPlaceholder,
} from './ShortcutLinksItem';

interface ShortcutLinksListProps {
  onLinkClick: () => void;
  onOptionsOpen: () => void;
  shortcutLinks: string[];
  shouldUseListFeedLayout: boolean;
  toggleShowTopSites: () => void;
  onReorder?: (links: string[]) => void;
  isManual?: boolean;
}

const placeholderLinks = Array.from({ length: 6 }).map((_, index) => index);

export function ShortcutLinksList({
  onLinkClick,
  onOptionsOpen,
  toggleShowTopSites,
  shortcutLinks,
  shouldUseListFeedLayout,
  onReorder,
  isManual,
}: ShortcutLinksListProps): ReactElement {
  const hasShortcuts = shortcutLinks?.length > 0;

  // 5px distance activation lets a plain click through (so normal navigation
  // still works) while still picking up any meaningful drag gesture.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Same guard the hub/webapp rows use — document-level click capture so the
  // stray click the browser fires on drag-release never navigates the tab,
  // even if the drop lands outside the row's DOM subtree.
  const { armGuard, onClickCapture } = useDragClickGuard();

  const handleDragEnd = (event: DragEndEvent) => {
    armGuard();
    const { active, over } = event;

    if (!over || active.id === over.id || !onReorder || !isManual) {
      return;
    }

    const oldIndex = shortcutLinks.indexOf(active.id as string);
    const newIndex = shortcutLinks.indexOf(over.id as string);

    const reorderedLinks = arrayMove(shortcutLinks, oldIndex, newIndex);
    onReorder(reorderedLinks);
  };

  const options = [
    {
      icon: <WrappingMenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: toggleShowTopSites,
    },
    {
      icon: <WrappingMenuIcon Icon={SettingsIcon} />,
      label: 'Manage',
      action: onOptionsOpen,
    },
  ];

  const content = (
    <div
      onClickCapture={onClickCapture}
      onAuxClickCapture={onClickCapture}
      onDragStartCapture={(event) => event.preventDefault()}
      className={classNames(
        'hidden tablet:flex',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : 'mb-5',
      )}
    >
      {hasShortcuts && (
        <>
          {shortcutLinks.map((url) => (
            <ShortcutLinksItem
              key={url}
              url={url}
              onLinkClick={onLinkClick}
              isDraggable={Boolean(isManual && onReorder)}
            />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<MenuIcon className="rotate-90" secondary />}
                className="mt-2"
                aria-label="toggle shortcuts menu"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuOptions options={options} />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      {!hasShortcuts && (
        <>
          {placeholderLinks.map((index) => (
            <ShortcutItemPlaceholder
              isCtaAddShortcut={index === 0}
              key={index}
              onClick={onOptionsOpen}
            />
          ))}
          <Button
            aria-label="Remove shortcuts"
            variant={ButtonVariant.Tertiary}
            onClick={toggleShowTopSites}
            size={ButtonSize.Small}
            icon={<ClearIcon secondary />}
            className="mt-2"
          />
        </>
      )}
    </div>
  );

  if (hasShortcuts && isManual && onReorder) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={armGuard}
        onDragCancel={armGuard}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={shortcutLinks}
          strategy={horizontalListSortingStrategy}
        >
          {content}
        </SortableContext>
      </DndContext>
    );
  }

  return content;
}
