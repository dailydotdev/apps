import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useHotTakes, MAX_HOT_TAKES } from '../../hooks/useHotTakes';
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
  HotTake,
  AddHotTakeInput,
} from '../../../../graphql/user/userHotTake';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';
import { useVoteHotTake } from '../../../../hooks/vote/useVoteHotTake';
import { Origin } from '../../../../lib/log';

interface ProfileUserHotTakesProps {
  user: PublicProfile;
}

export function ProfileUserHotTakes({
  user,
}: ProfileUserHotTakesProps): ReactElement | null {
  const { hotTakes, isOwner, canAddMore, add, update, remove } =
    useHotTakes(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { toggleUpvote } = useVoteHotTake();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HotTake | null>(null);

  const handleAdd = useCallback(
    async (input: AddHotTakeInput) => {
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

  const handleEdit = useCallback((item: HotTake) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (input: AddHotTakeInput) => {
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
    async (item: HotTake) => {
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

  const handleUpvote = useCallback(
    async (item: HotTake) => {
      await toggleUpvote({ payload: item, origin: Origin.HotTakeList });
    },
    [toggleUpvote],
  );

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
        <div className="flex flex-col gap-2">
          {hotTakes.map((item) => (
            <HotTakeItem
              key={item.id}
              item={item}
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpvoteClick={handleUpvote}
            />
          ))}
        </div>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-4 rounded-16 bg-surface-float p-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-overlay-quaternary-cabbage">
              <span className="text-3xl">🔥</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Primary}
                bold
              >
                Share your hot takes
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                What are the opinions that define you as a developer?
              </Typography>
            </div>
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
