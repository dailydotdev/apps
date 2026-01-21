import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useUserTools } from '../../hooks/useUserTools';
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
import { PlusIcon, HammerIcon } from '../../../../components/icons';
import { UserToolSection } from './UserToolSection';
import { UserToolModal } from './UserToolModal';
import type {
  UserTool,
  AddUserToolInput,
} from '../../../../graphql/user/userTool';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';

interface ProfileUserToolsProps {
  user: PublicProfile;
}

// Predefined category order
const CATEGORY_ORDER = [
  'Development',
  'Design',
  'Productivity',
  'Communication',
  'AI',
];

export function ProfileUserTools({
  user,
}: ProfileUserToolsProps): ReactElement | null {
  const { toolItems, groupedByCategory, isOwner, add, update, remove } =
    useUserTools(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserTool | null>(null);

  const handleAdd = useCallback(
    async (input: AddUserToolInput) => {
      try {
        await add(input);
        displayToast('Added to your tools');
      } catch (error) {
        displayToast('Failed to add tool');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleEdit = useCallback((item: UserTool) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const handleUpdate = useCallback(
    async (input: AddUserToolInput) => {
      if (!editingItem) {
        return;
      }
      try {
        await update({
          id: editingItem.id,
          input: {
            category: input.category,
          },
        });
        displayToast('Tool updated');
      } catch (error) {
        displayToast('Failed to update tool');
        throw error;
      }
    },
    [editingItem, update, displayToast],
  );

  const handleDelete = useCallback(
    async (item: UserTool) => {
      const confirmed = await showPrompt({
        title: 'Remove tool?',
        description: `Are you sure you want to remove "${item.tool.title}" from your tools?`,
        okButton: { title: 'Remove', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(item.id);
        displayToast('Removed from your tools');
      } catch (error) {
        displayToast('Failed to remove tool');
      }
    },
    [remove, displayToast, showPrompt],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  // Sort categories: predefined first, then custom alphabetically
  const sortedCategories = Object.keys(groupedByCategory).sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a);
    const bIndex = CATEGORY_ORDER.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) {
      return -1;
    }
    if (bIndex !== -1) {
      return 1;
    }
    return a.localeCompare(b);
  });

  const hasItems = toolItems.length > 0;

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
          Tools
        </Typography>
        {isOwner && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Add
          </Button>
        )}
      </div>

      {hasItems ? (
        <div className="flex flex-col gap-4">
          {sortedCategories.map((category) => (
            <UserToolSection
              key={category}
              category={category}
              items={groupedByCategory[category]}
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-surface-float">
              <HammerIcon className="text-text-tertiary" />
            </div>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Share the tools you use with the community
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              Add your first tool
            </Button>
          </div>
        )
      )}

      {isModalOpen && (
        <UserToolModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={editingItem ? handleUpdate : handleAdd}
          existingItem={editingItem || undefined}
        />
      )}
    </div>
  );
}
