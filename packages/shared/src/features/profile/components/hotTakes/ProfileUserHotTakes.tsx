import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useUserHotTakes, MAX_HOT_TAKES } from '../../hooks/useUserHotTakes';
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
import { HotTakeItem } from './HotTakeItem';
import { HotTakeModal } from './HotTakeModal';
import type {
  UserHotTake,
  AddUserHotTakeInput,
} from '../../../../graphql/user/userHotTake';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';

interface ProfileUserHotTakesProps {
  user: PublicProfile;
}

export function ProfileUserHotTakes({
  user,
}: ProfileUserHotTakesProps): ReactElement | null {
  const { hotTakes, isOwner, canAddMore, add, update, remove } =
    useUserHotTakes(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserHotTake | null>(null);

  const handleAdd = useCallback(
    async (input: AddUserHotTakeInput) => {
      try {
        await add(input);
        displayToast('Hot take added');
      } catch (error) {
        displayToast('Failed to add hot take');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleEdit = useCallback((item: UserHotTake) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (input: AddUserHotTakeInput) => {
      if (!editingItem) {
        return;
      }
      try {
        await update({
          id: editingItem.id,
          input: {
            emoji: input.emoji,
            title: input.title,
            subtitle: input.subtitle || null,
          },
        });
        displayToast('Hot take updated');
      } catch (error) {
        displayToast('Failed to update hot take');
        throw error;
      }
    },
    [editingItem, update, displayToast],
  );

  const handleDelete = useCallback(
    async (item: UserHotTake) => {
      const confirmed = await showPrompt({
        title: 'Remove hot take?',
        description: `Are you sure you want to remove "${item.title}"?`,
        okButton: { title: 'Remove', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(item.id);
        displayToast('Hot take removed');
      } catch (error) {
        displayToast('Failed to remove hot take');
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
      displayToast(`Maximum of ${MAX_HOT_TAKES} hot takes allowed`);
      return;
    }
    setIsModalOpen(true);
  }, [canAddMore, displayToast]);

  const hasItems = hotTakes.length > 0;

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
          Hot Takes
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
        <div className="flex flex-col gap-3">
          {hotTakes.map((item) => (
            <HotTakeItem
              key={item.id}
              item={item}
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Share your hot takes with the community
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Add your first hot take
            </Button>
          </div>
        )
      )}

      {isModalOpen && (
        <HotTakeModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={editingItem ? handleUpdate : handleAdd}
          existingItem={editingItem || undefined}
        />
      )}
    </div>
  );
}
