import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import type { ButtonSize } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { PostOptionButton } from '../../features/posts/PostOptionButton';
import { LinkIcon } from '../icons';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';

export interface PostMenuOptionsProps {
  post: Post;
  origin: Origin;
  buttonSize?: ButtonSize;
  /**
   * Classes for the ⋯ trigger alone. A host that restyles the menu glyph must
   * target it here: a selector on a wrapper around this component would also
   * reach the copy link beside it.
   */
  menuTriggerClassName?: string;
}

export function PostMenuOptions({
  post,
  origin,
  buttonSize,
  menuTriggerClassName,
}: PostMenuOptionsProps): ReactElement {
  const [linkCopied, copyLink] = useCopyPostLink();
  const { logEvent } = useLogContext();

  const onCopyLink = () => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyLink, origin },
      }),
    );
    // `shorten`, not an awaited short URL: awaiting the shortener first ends
    // the task that handled the click, and Safari refuses the write after
    // that. The permalink lands immediately and the tracked link replaces it.
    copyLink({
      link: post.commentsPermalink,
      shorten: true,
      cid: ReferralCampaignKey.SharePost,
    });
  };

  return (
    <>
      {/* Beside the menu rather than in any one header: every post type builds
          its own header, and this is the only control all of them share. */}
      {post && (
        <Tooltip side="bottom" content="Copy link">
          <Button
            aria-label="Copy link"
            className="hidden laptop:flex"
            icon={<CopyStateIcon copied={linkCopied} icon={LinkIcon} />}
            onClick={onCopyLink}
            size={buttonSize}
            type="button"
            variant={ButtonVariant.Tertiary}
          />
        </Tooltip>
      )}
      <PostOptionButton
        post={post}
        size={buttonSize}
        triggerClassName={menuTriggerClassName}
        variant={ButtonVariant.Tertiary}
        origin={origin}
      />
    </>
  );
}
