import type { FormEvent, ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
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
import type {
  TextFormCover,
  TextFormHandle,
} from '../../../components/post/composer/TextForm';
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
  const { canPost, blockedReason, isJoining, ensureCanPost, openComposer } =
    useWatercoolerPosting({ squad });
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const formRef = useRef<TextFormHandle>(null);
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
    onPostSuccess: () => {
      collapse();
      displayToast(
        moderationRequired(squad)
          ? '✅ Your post has been submitted for moderation'
          : '✅ Your post has been created!',
      );
      // Prefix match: the page keys its feed on the squad + variables, and the
      // new post belongs at the top of it.
      queryClient.invalidateQueries({ queryKey: ['sourceFeed'] });
    },
  });

  const onExpand = useCallback(async () => {
    if (!(await ensureCanPost())) {
      return;
    }

    setIsExpanded(true);
  }, [ensureCanPost]);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const title = text.title.trim();
      if (!title || isPosting) {
        return;
      }

      // Membership can lapse between expanding and posting (another tab, a
      // slow join), so this is re-checked rather than assumed.
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
    // The typed text carries over. An attached cover does not — the modal takes
    // no cover prop — so the inline draft is only cleared once the modal is up.
    await openComposer({ title: text.title, content: text.body });
    collapse();
  }, [collapse, openComposer, text]);

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
        ref={formRef}
        value={text}
        onChange={setText}
        sourceId={squad.id}
        cover={cover}
        onCoverChange={setCover}
        toolbarRightActions={
          <span className="flex flex-row items-center gap-2">
            <Tooltip content="Open full composer">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<MaximizeIcon />}
                onClick={onOpenFullComposer}
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
