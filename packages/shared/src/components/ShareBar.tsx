import React, { ReactElement, useContext } from 'react';
import { CopyIcon, WhatsappIcon, TwitterIcon, FacebookIcon } from './icons';
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
import { SocialShareButton } from './widgets/SocialShareButton';
import { SquadsToShare } from './squads/SquadsToShare';
import { ButtonSize, ButtonVariant } from './buttons/common';

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
        onSharedSuccessfully: () =>
          trackEvent(postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post)),
      },
    });
  };

  return (
    <WidgetContainer className="hidden flex-col p-3 laptop:flex">
      <p className="mb-4 text-theme-label-tertiary typo-callout">
        Would you recommend this post?
      </p>
      <div className="grid grid-cols-4 gap-2 gap-y-4">
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          onClick={trackAndCopyLink}
          pressed={copying}
          icon={
            <CopyIcon
              className={copying && 'text-theme-color-avocado'}
              secondary={copying}
            />
          }
          label={copying ? 'Copied!' : 'Copy link'}
        />
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          href={getWhatsappShareLink(href)}
          icon={<WhatsappIcon secondary />}
          className="text-white"
          onClick={() => onClick(ShareProvider.WhatsApp)}
          label="WhatsApp"
        />
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          href={getFacebookShareLink(href)}
          icon={<FacebookIcon secondary />}
          onClick={() => onClick(ShareProvider.Facebook)}
          label="Facebook"
        />
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          href={getTwitterShareLink(href, post?.title)}
          icon={<TwitterIcon />}
          onClick={() => onClick(ShareProvider.Twitter)}
          label="X"
        />
        <SquadsToShare
          size={ButtonSize.Medium}
          squadAvatarSize="large"
          onClick={(_, squad) => onShareToSquad(squad)}
        />
      </div>
    </WidgetContainer>
  );
}
