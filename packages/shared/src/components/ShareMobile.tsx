import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { LinkIcon, ShareIcon } from './icons';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
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

  const onShare = () => {
    logEvent(
      postLogEvent(LogEvent.StartShareToSquad, post, {
        ...(logOpts && logOpts),
      }),
    );
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
