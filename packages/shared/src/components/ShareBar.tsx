import React, { ReactElement, useContext } from 'react';
import CopyIcon from './icons/Copy';
import WhatsappIcon from './icons/Whatsapp';
import TwitterIcon from './icons/Twitter';
import FacebookIcon from './icons/Facebook';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  getFacebookShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../lib/share';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { WidgetContainer } from './widgets/common';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';
import { Squad } from '../graphql/sources';
import { SocialShareIcon } from './widgets/SocialShareIcon';
import { SquadsToShare } from './squads/SquadsToShare';
import { ButtonSize } from './buttons/Button';

interface ShareBarProps {
  post: Post;
}

export default function ShareBar({ post }: ShareBarProps): ReactElement {
  const href = post.commentsPermalink;
  const [copying, copyLink] = useCopyPostLink(href);
  const { trackEvent } = useContext(AnalyticsContext);
  const { openModal } = useLazyModal();

  const onClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const trackAndCopyLink = () => {
    copyLink();
    onClick(ShareProvider.CopyLink);
  };

  const onShareToSquad = (squad: Squad) => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.StartShareToSquad, post));
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        squad,
        preview: post,
        onSharedSuccessfully: () => {
          return trackEvent(
            postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post),
          );
        },
      },
    });
  };

  return (
    <WidgetContainer className="hidden laptop:flex flex-col p-3">
      <p className="mb-4 typo-callout text-theme-label-tertiary">
        One-click share
      </p>
      <div className="grid grid-cols-4 gap-2 gap-y-4">
        <SocialShareIcon
          size={ButtonSize.Medium}
          onClick={trackAndCopyLink}
          pressed={copying}
          className="btn-tertiary"
          icon={
            <CopyIcon
              className={copying && 'text-theme-color-avocado'}
              secondary={copying}
            />
          }
          label={copying ? 'Copied!' : 'Copy link'}
        />
        <SocialShareIcon
          size={ButtonSize.Medium}
          href={getWhatsappShareLink(href)}
          icon={<WhatsappIcon secondary />}
          className="text-white btn-tertiary"
          onClick={() => onClick(ShareProvider.WhatsApp)}
          label="WhatsApp"
        />
        <SocialShareIcon
          size={ButtonSize.Medium}
          href={getFacebookShareLink(href)}
          icon={<FacebookIcon secondary />}
          className="btn-tertiary"
          onClick={() => onClick(ShareProvider.Facebook)}
          label="Facebook"
        />
        <SocialShareIcon
          size={ButtonSize.Medium}
          href={getTwitterShareLink(href, post?.title)}
          icon={<TwitterIcon secondary />}
          className="btn-tertiary"
          onClick={() => onClick(ShareProvider.Twitter)}
          label="Twitter"
        />
        <SquadsToShare
          size={ButtonSize.Medium}
          squadIconSize="large"
          onClick={(_, squad) => onShareToSquad(squad)}
        />
      </div>
    </WidgetContainer>
  );
}
