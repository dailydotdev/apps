import React, { ReactElement } from 'react';
import { CopyIcon, LinkIcon, ShareIcon } from './icons';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { WidgetContainer } from './widgets/common';
import { postAnalyticsEvent } from '../lib/feed';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { Post } from '../graphql/posts';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { useSharePost } from '../hooks/useSharePost';
import { UsePostContent } from '../hooks/usePostContent';

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
  const { trackEvent } = useAnalyticsContext();

  const onShare = () => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.StartShareToSquad, post));
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
