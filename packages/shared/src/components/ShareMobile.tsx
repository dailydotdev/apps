import React, { ReactElement } from 'react';

import { useLogContext } from '../contexts/LogContext';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { UsePostContent } from '../hooks/usePostContent';
import { useSharePost } from '../hooks/useSharePost';
import { postLogEvent } from '../lib/feed';
import { LogEvent, Origin } from '../lib/log';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { LinkIcon, ShareIcon } from './icons';
import { WidgetContainer } from './widgets/common';

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

  const onShare = () => {
    logEvent(postLogEvent(LogEvent.StartShareToSquad, post));
    openSharePost({ post });
  };

  return (
    <WidgetContainer className="flex flex-col items-start gap-2 p-3 laptop:hidden">
      <Button
        size={ButtonSize.Small}
        onClick={onCopyPostLink}
        pressed={copying}
        icon={<LinkIcon />}
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
