import React, { ReactElement, useContext } from 'react';
import { CopyIcon, WhatsappIcon, TwitterIcon, FacebookIcon } from './icons';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import {
  addLinkShareTrackingQuery,
  getShareLink,
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
import { useAuthContext } from '../contexts/AuthContext';
import { useGetShortUrl } from '../hooks';

interface ShareBarProps {
  post: Post;
}

export default function ShareBar({ post }: ShareBarProps): ReactElement {
  const href = post.commentsPermalink;
  const { user, isAuthReady } = useAuthContext();
  const cid = 'share_post';
  const link =
    isAuthReady && user
      ? addLinkShareTrackingQuery({ link: href, userId: user.id, cid })
      : href;
  const { getShortUrl } = useGetShortUrl();
  const [copying, copyLink] = useCopyPostLink(link);
  const { trackEvent } = useContext(AnalyticsContext);
  const { openModal } = useLazyModal();

  const trackClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const onClick = async (provider: ShareProvider) => {
    trackClick(provider);

    const shortLink = await getShortUrl(link);
    const shareLink = getShareLink({
      provider,
      link: shortLink,
      text: post?.title,
    });
    window.open(shareLink, '_blank');
  };

  const trackAndCopyLink = async () => {
    const shortLink = await getShortUrl(link);
    copyLink({ link: shortLink });
    trackClick(ShareProvider.CopyLink);
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
          icon={<WhatsappIcon secondary />}
          className="text-white"
          onClick={() => onClick(ShareProvider.WhatsApp)}
          label="WhatsApp"
        />
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          icon={<FacebookIcon secondary />}
          onClick={() => onClick(ShareProvider.Facebook)}
          label="Facebook"
        />
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
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
