import type { FormEvent, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MaximizeIcon } from '../../../components/icons';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import type { TextFormCover } from '../../../components/post/composer/TextForm';
import { TextForm } from '../../../components/post/composer/TextForm';
import type { TextFormState } from '../../../components/post/composer/types';
import { DEFAULT_TEXT } from '../../../components/post/composer/types';
import { moderationRequired } from '../../../components/squads/utils';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Squad } from '../../../graphql/sources';
import { usePostToSquad } from '../../../hooks/squads/usePostToSquad';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { useWatercoolerPosting } from '../hooks/useWatercoolerPosting';

interface WatercoolerComposerProps {
  squad: Squad;
}

const shellClasses =
  'w-full rounded-16 border border-border-subtlest-tertiary bg-surface-float';

export const WatercoolerComposer = ({
  squad,
}: WatercoolerComposerProps): ReactElement => {
  const { user } = useAuthContext();
  const {
    canPost,
    blockedReason,
    isJoining,
    checkGate,
    ensureCanPost,
    openComposer,
  } = useWatercoolerPosting({ squad });
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState<TextFormState>(DEFAULT_TEXT);
  const [cover, setCover] = useState<TextFormCover | null>(null);

  const collapse = useCallback(() => {
    setIsExpanded(false);
    setText(DEFAULT_TEXT);
    setCover(null);
  }, []);

  const { onSubmitFreeformPost, isPosting } = usePostToSquad({
    displayMutationErrors: true,
    // `onComplete`, not `onPostSuccess`: the latter is only called by the
    // direct-post mutations. A moderated squad routes through
    // `onCreatePostModeration`, which fires `onComplete` alone — so hanging
    // this off `onPostSuccess` would leave the composer expanded, holding a
    // draft that was in fact submitted, and invite a duplicate.
    onComplete: () => {
      collapse();
      displayToast(
        moderationRequired(squad)
          ? '✅ Your post has been submitted for moderation'
          : '✅ Your post has been created!',
      );
      // Scoped to this user's source feeds, matching the page's own key. A bare
      // ['sourceFeed'] would refetch every squad and source feed cached this
      // session to refresh one.
      queryClient.invalidateQueries({
        queryKey: ['sourceFeed', user?.id ?? 'anonymous'],
      });
    },
  });

  const onExpand = useCallback(() => {
    // Gate only — no join. Opening a draft shouldn't make someone a member of
    // a squad they may never post to.
    if (!checkGate()) {
      return;
    }

    setIsExpanded(true);
  }, [checkGate]);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const title = text.title.trim();
      if (!title || isPosting) {
        return;
      }

      // Where the join actually happens: only someone who goes through with a
      // post becomes a member.
      if (!(await ensureCanPost())) {
        return;
      }

      await onSubmitFreeformPost(
        {
          title,
          content: text.body,
          ...(cover?.file ? { image: cover.file } : {}),
        },
        squad,
      );
    },
    [cover, ensureCanPost, isPosting, onSubmitFreeformPost, squad, text],
  );

  const onOpenFullComposer = useCallback(async () => {
    // `inactive` only marks the button aria-disabled, it still fires onClick.
    if (cover) {
      return;
    }

    await openComposer({ title: text.title, content: text.body });
    collapse();
  }, [collapse, cover, openComposer, text]);

  if (!isExpanded) {
    return (
      <Tooltip content={blockedReason} visible={!!blockedReason}>
        <button
          type="button"
          onClick={onExpand}
          // `aria-disabled` over `disabled`: a disabled button swallows the
          // pointer events the tooltip needs to explain why it is blocked.
          aria-disabled={!canPost || undefined}
          className={`${shellClasses} flex flex-row items-center gap-3 px-4 py-3 text-left transition-colors hover:border-border-subtlest-secondary`}
        >
          {user && (
            <ProfilePicture user={user} size={ProfileImageSize.Medium} />
          )}
          <span className="flex-1 truncate text-text-quaternary typo-body">
            What&apos;s on your mind?
          </span>
        </button>
      </Tooltip>
    );
  }

  return (
    <form className={shellClasses} onSubmit={onSubmit}>
      <TextForm
        value={text}
        onChange={setText}
        sourceId={squad.id}
        cover={cover}
        onCoverChange={setCover}
        toolbarRightActions={
          <span className="flex flex-row items-center gap-2">
            {/* Only offered without a cover: the modal takes no cover prop, so
                handing the draft over would drop an attached image silently.
                Blocking the action beats losing the file. */}
            <Tooltip
              content={
                cover
                  ? 'Remove the cover to open the full composer'
                  : 'Open full composer'
              }
            >
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<MaximizeIcon />}
                onClick={onOpenFullComposer}
                inactive={!!cover}
                aria-label="Open full composer"
              />
            </Tooltip>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={collapse}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              loading={isPosting || isJoining}
              disabled={!text.title.trim()}
            >
              Post
            </Button>
          </span>
        }
      />
    </form>
  );
};
