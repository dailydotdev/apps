import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { CopyIcon, LinkIcon, ShareIcon } from './icons';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { useShareCopyIcon } from '../hooks/useShareCopyIcon';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { WidgetContainer } from './widgets/common';
import { postLogEvent } from '../lib/feed';
import { ActiveFeedContext } from '../contexts';
import type { Origin } from '../lib/log';
import { LogEvent } from '../lib/log';
import type { Post } from '../graphql/posts';
import { useLogContext } from '../contexts/LogContext';
import { useSharePost } from '../hooks/useSharePost';
import type { UsePostContent } from '../hooks/usePostContent';
import { useSharePostPage } from '../hooks/useSharePostPage';
import { ShareModuleHeader } from './post/share/ShareModuleHeader';

export interface ShareMobileProps {
  post: Post;
  link: string;
  origin: Origin;
  onCopyPostLink: UsePostContent['onCopyPostLink'];
}

export function ShareMobile({
  onCopyPostLink,
  post,
  link,
  origin,
}: ShareMobileProps): ReactElement {
  const [copying] = useCopyPostLink(link);
  const { openSharePost } = useSharePost(origin);
  const { logEvent } = useLogContext();
  const { logOpts } = useContext(ActiveFeedContext);
  const showCopyIcon = useShareCopyIcon();
  const isSharePostPageEnabled = useSharePostPage();

  const onShare = () => {
    logEvent(
      postLogEvent(LogEvent.StartShareToSquad, post, {
        ...(logOpts && logOpts),
      }),
    );
    openSharePost({ post });
  };

  // Redesigned module: a reason to share up top, then two full-width buttons
  // with a clear primary — instead of two same-weight coloured text links.
  if (isSharePostPageEnabled) {
    return (
      <WidgetContainer className="flex flex-col items-start gap-2 p-3 laptop:hidden">
        <ShareModuleHeader className="mb-1" />
        <Button
          className="w-full"
          size={ButtonSize.Small}
          onClick={onCopyPostLink}
          pressed={copying}
          icon={showCopyIcon ? <CopyIcon secondary={copying} /> : <LinkIcon />}
          variant={ButtonVariant.Primary}
        >
          {copying ? 'Copied!' : 'Copy link'}
        </Button>
        <Button
          className="w-full"
          size={ButtonSize.Small}
          onClick={onShare}
          icon={<ShareIcon />}
          variant={ButtonVariant.Secondary}
        >
          Share with your friends
        </Button>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer className="flex flex-col items-start gap-2 p-3 laptop:hidden">
      <Button
        size={ButtonSize.Small}
        onClick={onCopyPostLink}
        pressed={copying}
        icon={showCopyIcon ? <CopyIcon secondary={copying} /> : <LinkIcon />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Avocado}
      >
        {copying ? 'Copied!' : 'Copy link'}
      </Button>
      <Button
        size={ButtonSize.Small}
        onClick={onShare}
        icon={<ShareIcon />}
        variant={ButtonVariant.Tertiary}
        color={ButtonColor.Cabbage}
      >
        Share with your friends
      </Button>
    </WidgetContainer>
  );
}
