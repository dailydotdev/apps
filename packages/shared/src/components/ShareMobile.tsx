import React, { ReactElement } from 'react';
import { CopyIcon, ShareIcon } from './icons';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { WidgetContainer } from './widgets/common';
import { postAnalyticsEvent } from '../lib/feed';
import { AnalyticsEvent } from '../lib/analytics';
import { Post } from '../graphql/posts';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';

export interface Props {
  post: Post;
  link: string;
  share: () => void;
}

export function ShareMobile({ post, share, link }: Props): ReactElement {
  const [copying] = useCopyPostLink(link);

  const { trackEvent } = useAnalyticsContext();

  const onShare = () => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.StartShareToSquad, post));
    share();
  };

  return (
    <WidgetContainer className="flex flex-col items-start gap-2 p-3 laptop:hidden">
      <Button
        size={ButtonSize.Small}
        onClick={share}
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
