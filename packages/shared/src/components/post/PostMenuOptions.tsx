import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import type { ButtonSize } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { PostOptionButton } from '../../features/posts/PostOptionButton';
import { LinkIcon } from '../icons';
import type { IconProps } from '../Icon';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';

// The shared glyph leans the other way to the design for this button, and it
// is only this button: mirror it here rather than in the icon everything uses.
const MirroredLinkIcon = ({ className, ...props }: IconProps): ReactElement => (
  <LinkIcon {...props} className={classNames(className, '-scale-x-100')} />
);

export interface PostMenuOptionsProps {
  post: Post;
  origin: Origin;
  buttonSize?: ButtonSize;
}

export function PostMenuOptions({
  post,
  origin,
  buttonSize,
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
            icon={<CopyStateIcon copied={linkCopied} icon={MirroredLinkIcon} />}
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
        variant={ButtonVariant.Tertiary}
        origin={origin}
      />
    </>
  );
}
