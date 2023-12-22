import React, { ReactElement } from 'react';
import CopyIcon from './icons/Copy';
import ShareIcon from './icons/Share';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { Button, ButtonSize } from './buttons/Button';
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
        buttonSize={ButtonSize.Small}
        onClick={() => copyLink()}
        pressed={copying}
        icon={<CopyIcon />}
        className="btn-tertiary-avocado"
      >
        {copying ? 'Copied!' : 'Copy link'}
      </Button>
      <Button
        buttonSize={ButtonSize.Small}
        onClick={onShare}
        icon={<ShareIcon />}
        className="btn-tertiary-cabbage"
      >
        Share with your friends
      </Button>
    </WidgetContainer>
  );
}
