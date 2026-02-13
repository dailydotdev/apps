import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
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

interface ProfileUserStackProps {
  user: PublicProfile;
}

// Predefined section order - includes both stack sections and tool categories
const SECTION_ORDER = [
  'Primary',
  'Hobby',
  'Learning',
  'Past',
  'Development',
  'Design',
  'Productivity',
  'Communication',
  'AI',
];

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
  } = useUserStack(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { logEvent } = useLogContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserStack | null>(null);

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

  // Sort sections: predefined first, then custom alphabetically
  const sortedSections = Object.keys(groupedBySection).sort((a, b) => {
    const aIndex = SECTION_ORDER.indexOf(a);
    const bIndex = SECTION_ORDER.indexOf(b);
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

  const hasItems = stackItems.length > 0;

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
        <div className="flex flex-col gap-4">
          {sortedSections.map((section) => (
            <UserStackSection
              key={section}
              section={section}
              items={groupedBySection[section]}
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
