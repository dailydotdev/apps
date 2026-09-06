import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { LogEvent, Origin } from '../../lib/log';
import type { ButtonSize } from '../buttons/Button';
import { Button, ButtonVariant } from '../buttons/Button';
import { PostOptionButton } from '../../features/posts/PostOptionButton';
import { LinkIcon } from '../icons';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { Tooltip } from '../tooltip/Tooltip';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useGetShortUrl } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ReferralCampaignKey } from '../../lib/referral';
import { ShareProvider } from '../../lib/share';
import { useSharePlacement } from '../../features/snapshot/useSharePlacement';
import { featurePostCopyLink } from '../../lib/featureManagement';

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
  const isCopyLinkEnabled = useSharePlacement({
    feature: featurePostCopyLink,
    shouldEvaluate: !!post,
  });
  const [linkCopied, copyLink] = useCopyPostLink();
  const { getShortUrl } = useGetShortUrl();
  const { logEvent } = useLogContext();

  const onCopyLink = async () => {
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider: ShareProvider.CopyLink, origin: Origin.PostContent },
      }),
    );
    copyLink({
      link: await getShortUrl(
        post.commentsPermalink,
        ReferralCampaignKey.SharePost,
      ),
    });
  };

  return (
    <>
      {/* Beside the menu rather than in any one header: every post type builds
          its own header, and this is the only control all of them share. */}
      {isCopyLinkEnabled && post && (
        <Tooltip side="bottom" content="Copy link">
          <Button
            aria-label="Copy link"
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
        variant={ButtonVariant.Tertiary}
        origin={origin}
      />
    </>
  );
}
