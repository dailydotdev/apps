import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { PublicProfile } from '../../../../lib/user';
import { MAX_STACK_ITEMS } from '../../../../graphql/user/userStack';
import { useUserStack } from '../../hooks/useUserStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { PlusIcon } from '../../../../components/icons';
import { UserStackSection } from './UserStackSection';
import { UserStackModal } from './UserStackModal';
import type {
  UserStack,
  AddUserStackInput,
} from '../../../../graphql/user/userStack';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent } from '../../../../lib/log';
import {
  buildSectionsState,
  getReorderPayload,
  moveStackItem,
  SECTION_ORDER,
  sortSections,
} from './dnd';
import { UserStackItem } from './UserStackItem';

interface ProfileUserStackProps {
  user: PublicProfile;
}

export function ProfileUserStack({
  user,
}: ProfileUserStackProps): ReactElement | null {
  const {
    stackItems,
    groupedBySection,
    isOwner,
    canAddMore,
    add,
    update,
    remove,
    reorder,
  } = useUserStack(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserStack | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, UserStack[]>>(() =>
    buildSectionsState(stackItems),
  );
  const sectionsRef = useRef(sections);

  useEffect(() => {
    const nextSections = buildSectionsState(stackItems);
    sectionsRef.current = nextSections;
    setSections(nextSections);
  }, [stackItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAdd = useCallback(
    async (input: AddUserStackInput) => {
      try {
        await add(input);
        displayToast('Added to your stack');
      } catch (error) {
        displayToast('Failed to add item');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleEdit = useCallback((item: UserStack) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (input: AddUserStackInput) => {
      if (!editingItem) {
        return;
      }
      try {
        await update({
          id: editingItem.id,
          input: {
            section: input.section,
            title: input.title,
            startedAt: input.startedAt || null,
          },
        });
        displayToast('Stack item updated');
      } catch (error) {
        displayToast('Failed to update item');
        throw error;
      }
    },
    [editingItem, update, displayToast],
  );

  const handleDelete = useCallback(
    async (item: UserStack) => {
      const displayTitle = item.title ?? item.tool.title;
      const confirmed = await showPrompt({
        title: 'Remove from stack?',
        description: `Are you sure you want to remove "${displayTitle}" from your stack?`,
        okButton: { title: 'Remove', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(item.id);
        displayToast('Removed from your stack');
      } catch (error) {
        displayToast('Failed to remove item');
      }
    },
    [remove, displayToast, showPrompt],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    if (!canAddMore) {
      displayToast(`Maximum of ${MAX_STACK_ITEMS} stack items allowed`);
      return;
    }
    logEvent({
      event_name: LogEvent.StartAddUserStack,
    });
    setIsModalOpen(true);
  }, [canAddMore, displayToast, logEvent]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItemId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setSections((currentSections) => {
      const nextSections = moveStackItem({
        activeId: String(active.id),
        overId: String(over.id),
        sections: currentSections,
      });
      sectionsRef.current = nextSections;

      return nextSections;
    });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveItemId(null);

      if (!event.over) {
        const nextSections = buildSectionsState(stackItems);
        sectionsRef.current = nextSections;
        setSections(nextSections);
        return;
      }

      const nextItems = getReorderPayload(sectionsRef.current);
      const previousSections = buildSectionsState(stackItems);
      const previousItems = getReorderPayload(previousSections);
      const hasChanges =
        JSON.stringify(nextItems) !== JSON.stringify(previousItems);

      if (!hasChanges) {
        return;
      }

      try {
        await reorder(nextItems);
      } catch (error) {
        sectionsRef.current = previousSections;
        setSections(previousSections);
        displayToast('Failed to reorder stack items');
      }
    },
    [displayToast, reorder, stackItems],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItemId(null);
    const nextSections = buildSectionsState(stackItems);
    sectionsRef.current = nextSections;
    setSections(nextSections);
  }, [stackItems]);

  const activeItem =
    activeItemId && stackItems.find((item) => item.id === activeItemId);

  const hasItems = stackItems.length > 0;
  const visibleSections = isOwner
    ? sortSections([
        ...new Set([...SECTION_ORDER, ...Object.keys(groupedBySection)]),
      ])
    : sortSections(Object.keys(groupedBySection));

  if (!hasItems && !isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Stack & Tools
        </Typography>
        {isOwner && canAddMore && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={handleOpenModal}
          >
            Add
          </Button>
        )}
      </div>

      {hasItems ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-col gap-4">
            {visibleSections.map((section) => (
              <UserStackSection
                key={section}
                section={section}
                items={sections[section] ?? []}
                isOwner={isOwner}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeItem ? (
              <div className="opacity-90 w-fit max-w-full">
                <UserStackItem item={activeItem} isOwner={false} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Share your stack & tools with the community
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Add your first item
            </Button>
          </div>
        )
      )}

      {isModalOpen && (
        <UserStackModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={editingItem ? handleUpdate : handleAdd}
          existingItem={editingItem || undefined}
        />
      )}
    </div>
  );
}
