import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { InviteLinkInput } from '../../referral/InviteLinkInput';
import { Origin, LogEvent } from '../../../lib/log';
import type { Post } from '../../../graphql/posts';
import { usePostActions } from '../../../hooks/post/usePostActions';
import { ShareProvider } from '../../../lib/share';
import { ReferralCampaignKey, useGetShortUrl } from '../../../hooks';
import { PostContentWidget } from './PostContentWidget';
import { useActiveFeedContext } from '../../../contexts';
import { postLogEvent } from '../../../lib/feed';
import { ButtonV2 } from '../../buttons/ButtonV2';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/common';
import { LinkIcon } from '../../icons';
import { useCopyText } from '../../../hooks/useCopy';
import {
  ToastType,
  useToastNotification,
} from '../../../hooks/useToastNotification';
import { useLogContext } from '../../../contexts/LogContext';
import { useSharePlacement } from '../../../features/snapshot/useSharePlacement';
import { featurePostSharePrompts } from '../../../lib/featureManagement';

interface PostContentShareProps {
  post: Post;
}

export function PostContentShare({
  post,
}: PostContentShareProps): ReactElement | null {
  const { onInteract, interaction } = usePostActions({ post });
  const { logOpts } = useActiveFeedContext();
  const { isLoading, shareLink } = useGetShortUrl({
    query: {
      url: post.commentsPermalink,
      cid: ReferralCampaignKey.SharePost,
      enabled: interaction === 'upvote',
    },
  });

  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const areSharePromptsEnabled = useSharePlacement({
    feature: featurePostSharePrompts,
  });
  const [, copy] = useCopyText(shareLink);

  const onCopy = useCallback(async () => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: {
          provider: ShareProvider.CopyLink,
          origin: Origin.PostContent,
        },
        ...(logOpts && logOpts),
      }),
    );

    try {
      await copy({ message: '✅ Copied link' });
      // The prompt has done its job; leaving it up nags.
      onInteract('none');
    } catch {
      displayToast('❌ Your browser blocked the clipboard', {
        variant: ToastType.Error,
      });
    }
  }, [copy, displayToast, logEvent, logOpts, onInteract, post]);

  if (interaction !== 'upvote' || isLoading) {
    return null;
  }

  if (areSharePromptsEnabled) {
    // A prompt, not a form: the link in an input asks to be read before it can
    // be used, and there is only one thing to do with it.
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold text-text-primary typo-callout">
            Should anyone else see this post?
          </span>
          <span className="text-text-tertiary typo-callout">
            You upvoted it — pass it on.
          </span>
        </div>
        <ButtonV2
          icon={<LinkIcon />}
          iconPosition={ButtonIconPosition.Right}
          onClick={onCopy}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Primary}
        >
          Copy link
        </ButtonV2>
      </div>
    );
  }

  return (
    <PostContentWidget
      className="mt-6"
      title="Should anyone else see this post?"
    >
      <InviteLinkInput
        className={{ container: 'w-full flex-1' }}
        link={shareLink}
        onCopy={() => onInteract('none')}
        logProps={postLogEvent(LogEvent.SharePost, post, {
          extra: {
            provider: ShareProvider.CopyLink,
            origin: Origin.PostContent,
          },
          ...(logOpts && logOpts),
        })}
      />
    </PostContentWidget>
  );
}
