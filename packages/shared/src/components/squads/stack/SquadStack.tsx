import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import type { Squad } from '../../../graphql/sources';
import { useSourceStack } from '../../../hooks/source/useSourceStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import { SourceStackItem } from './SourceStackItem';
import { SourceStackModal } from './SourceStackModal';
import type {
  SourceStack,
  AddSourceStackInput,
} from '../../../graphql/source/sourceStack';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { usePrompt } from '../../../hooks/usePrompt';
import { MAX_STACK_ITEMS } from '../../../features/profile/hooks/useUserStack';

interface SquadStackProps {
  squad: Squad;
}

export function SquadStack({ squad }: SquadStackProps): ReactElement | null {
  const { stackItems, canEdit, canAddMore, add, update, remove } =
    useSourceStack(squad);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SourceStack | null>(null);

  const handleAdd = useCallback(
    async (input: AddSourceStackInput) => {
      try {
        await add(input);
        displayToast('Added to squad stack');
      } catch (error) {
        displayToast('Failed to add item');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleEdit = useCallback((item: SourceStack) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (input: AddSourceStackInput) => {
      if (!editingItem) {
        return;
      }
      try {
        await update({
          id: editingItem.id,
          input: {
            title: input.title,
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
    async (item: SourceStack) => {
      const displayTitle = item.title ?? item.tool.title;
      const confirmed = await showPrompt({
        title: 'Remove from stack?',
        description: `Are you sure you want to remove "${displayTitle}" from the squad stack?`,
        okButton: { title: 'Remove', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(item.id);
        displayToast('Removed from squad stack');
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
    setIsModalOpen(true);
  }, [canAddMore, displayToast]);

  const hasItems = stackItems.length > 0;

  if (!hasItems && !canEdit) {
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
        {canEdit && canAddMore && (
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
        <div className="flex flex-wrap gap-2">
          {stackItems.map((item) => (
            <SourceStackItem
              key={item.id}
              item={item}
              canEdit={canEdit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        canEdit && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Share your squad&apos;s stack & tools
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
        <SourceStackModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={editingItem ? handleUpdate : handleAdd}
          existingItem={editingItem || undefined}
        />
      )}
    </div>
  );
}
