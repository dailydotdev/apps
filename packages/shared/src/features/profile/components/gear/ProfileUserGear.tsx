import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { PublicProfile } from '../../../../lib/user';
import { useGear } from '../../hooks/useGear';
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
import { PlusIcon, SettingsIcon } from '../../../../components/icons';
import { SortableGearItem } from './GearItem';
import { GearModal } from './GearModal';
import type { Gear, AddGearInput } from '../../../../graphql/user/gear';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';

interface ProfileUserGearProps {
  user: PublicProfile;
}

export function ProfileUserGear({
  user,
}: ProfileUserGearProps): ReactElement | null {
  const { gearItems, isOwner, add, remove, reorder } = useGear(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = gearItems.findIndex((g) => g.id === active.id);
      const newIndex = gearItems.findIndex((g) => g.id === over.id);
      const reordered = arrayMove(gearItems, oldIndex, newIndex);

      reorder(
        reordered.map((item, index) => ({
          id: item.id,
          position: index,
        })),
      ).catch(() => {
        displayToast('Failed to reorder gear');
      });
    },
    [gearItems, reorder, displayToast],
  );

  const handleAdd = useCallback(
    async (input: AddGearInput) => {
      try {
        await add(input);
        displayToast('Gear added');
      } catch (error) {
        displayToast('Failed to add gear');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleDelete = useCallback(
    async (item: Gear) => {
      const confirmed = await showPrompt({
        title: 'Remove gear?',
        description: `Are you sure you want to remove "${item.gear.name}" from your gear?`,
        okButton: { title: 'Remove', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(item.id);
        displayToast('Gear removed');
      } catch (error) {
        displayToast('Failed to remove gear');
      }
    },
    [remove, displayToast, showPrompt],
  );

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const hasItems = gearItems.length > 0;

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
          Gear
        </Typography>
        {isOwner && (
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
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={gearItems.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {gearItems.map((item) => (
                <SortableGearItem
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  isDraggable={isOwner && gearItems.length > 1}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-surface-float">
              <SettingsIcon className="text-text-tertiary" />
            </div>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Share the gear you use with the community
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Add your first gear
            </Button>
          </div>
        )
      )}

      {isModalOpen && (
        <GearModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={handleAdd}
        />
      )}
    </div>
  );
}
