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
  ShortcutLinksItem,
  ShortcutItemPlaceholder,
} from './ShortcutLinksItem';

interface ShortcutLinksListProps {
  onLinkClick: () => void;
  onOptionsOpen: () => void;
  shortcutLinks: string[];
  shouldUseListFeedLayout: boolean;
  showTopSites: boolean;
  toggleShowTopSites: () => void;
  hasCheckedPermission?: boolean;
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
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
      className={classNames(
        'hidden tablet:flex',
        shouldUseListFeedLayout ? 'mx-6 mb-3 mt-1' : 'mb-5',
      )}
    >
      {hasShortcuts && (
        <>
          {shortcutLinks.map((url) => (
            <ShortcutLinksItem key={url} url={url} onLinkClick={onLinkClick} />
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
