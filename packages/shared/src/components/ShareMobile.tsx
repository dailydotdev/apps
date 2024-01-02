import React, { ReactElement } from 'react';
import CopyIcon from './icons/Copy';
import ShareIcon from './icons/Share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/ButtonV2';
import { WidgetContainer } from './widgets/common';
import { postAnalyticsEvent } from '../lib/feed';
import { AnalyticsEvent } from '../lib/analytics';
import { Post } from '../graphql/posts';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';

export interface Props {
  post: Post;
  link: string;
  share: (post: Post) => void;
}

export function ShareMobile({ post, share, link }: Props): ReactElement {
  const [copying, copyLink] = useCopyPostLink(link);
  const { trackEvent } = useAnalyticsContext();

  const onShare = () => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.StartShareToSquad, post));
    share(post);
  };

  return (
    <WidgetContainer className="flex flex-col items-start gap-2 p-3 laptop:hidden">
      <Button
        size={ButtonSize.Small}
        onClick={() => copyLink()}
        pressed={copying}
        icon={<CopyIcon />}
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
