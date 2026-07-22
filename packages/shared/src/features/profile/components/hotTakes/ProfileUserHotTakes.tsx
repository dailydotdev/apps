import type { ReactElement } from 'react';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { PublicProfile } from '../../../../lib/user';
import {
  HOT_TAKE_LIMIT_REACHED_MESSAGE,
  useHotTakes,
} from '../../hooks/useHotTakes';
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
import { useLogContext } from '../../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../../lib/log';
import {
  getHotTakesProfileUrl,
  HOT_TAKES_ANCHOR,
  isOpenAddHotTakeQuery,
  OPEN_ADD_HOT_TAKE_QUERY_PARAM,
} from './common';
import { HotTakeShareControl } from './HotTakeShareButton';
import { useHotTakeShareEnabled } from '../../../../hooks/useHotTakeShareEnabled';

interface ProfileUserHotTakesProps {
  user: PublicProfile;
}

export function ProfileUserHotTakes({
  user,
}: ProfileUserHotTakesProps): ReactElement | null {
  const router = useRouter();
  const { hotTakes, isOwner, canAddMore, add, update, remove, isLoading } =
    useHotTakes(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { toggleUpvote } = useVoteHotTake();
  const { logEvent } = useLogContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HotTake | null>(null);
  const handledOpenAddHotTakeQueryRef = useRef(false);

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
      displayToast(HOT_TAKE_LIMIT_REACHED_MESSAGE);
      return;
    }
    logEvent({
      event_name: LogEvent.StartAddHotTake,
    });
    setIsModalOpen(true);
  }, [canAddMore, displayToast, logEvent]);

  const clearOpenAddHotTakeQuery = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has(OPEN_ADD_HOT_TAKE_QUERY_PARAM)) {
      return;
    }

    url.searchParams.delete(OPEN_ADD_HOT_TAKE_QUERY_PARAM);
    router.replace(`${url.pathname}${url.search}${url.hash}`, undefined, {
      shallow: true,
    });
  }, [router]);

  const shouldOpenAddHotTakeFromQuery = isOpenAddHotTakeQuery(
    router.query[OPEN_ADD_HOT_TAKE_QUERY_PARAM],
  );

  useEffect(() => {
    if (!shouldOpenAddHotTakeFromQuery) {
      handledOpenAddHotTakeQueryRef.current = false;
      return;
    }

    if (handledOpenAddHotTakeQueryRef.current || isLoading || !isOwner) {
      return;
    }

    handledOpenAddHotTakeQueryRef.current = true;
    handleOpenModal();
    clearOpenAddHotTakeQuery();
  }, [
    clearOpenAddHotTakeQuery,
    handleOpenModal,
    isLoading,
    isOwner,
    shouldOpenAddHotTakeFromQuery,
  ]);

  const handleUpvote = useCallback(
    async (item: HotTake) => {
      await toggleUpvote({ payload: item, origin: Origin.HotTakeList });
    },
    [toggleUpvote],
  );

  const hasItems = hotTakes.length > 0;
  const ownerUsername = user.username;
  // Sharing an empty section is pointless, so the flag is only evaluated (and
  // the control only rendered) once there is at least one take.
  const isShareEnabled = useHotTakeShareEnabled(hasItems) && hasItems;

  if (!hasItems && !isOwner) {
    return null;
  }

  const addButton = isOwner && canAddMore && (
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<PlusIcon />}
      onClick={handleOpenModal}
    >
      Add
    </Button>
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <a id={HOT_TAKES_ANCHOR} />
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Hot Takes
        </Typography>
        {isShareEnabled && ownerUsername ? (
          <div className="flex items-center gap-1">
            <HotTakeShareControl
              link={getHotTakesProfileUrl(ownerUsername)}
              text={
                isOwner
                  ? "My hot takes on daily.dev — come tell me why I'm wrong."
                  : `@${ownerUsername}'s hot takes on daily.dev — come tell them why they're wrong.`
              }
              label="Share hot takes"
              targetId={user.id}
              origin={Origin.HotTakeList}
              buttonSize={ButtonSize.Small}
            />
            {addButton}
          </div>
        ) : (
          addButton
        )}
      </div>
      {hasItems ? (
        <div className="flex flex-col gap-2">
          {hotTakes.map((item) => (
            <HotTakeItem
              key={item.id}
              item={item}
              isOwner={isOwner}
              ownerUsername={user.username}
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
