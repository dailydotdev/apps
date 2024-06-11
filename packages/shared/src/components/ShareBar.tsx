import React, { ReactElement, useContext } from 'react';
import { CopyIcon, FacebookIcon, TwitterIcon, WhatsappIcon } from './icons';
import { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { getShareLink, ShareProvider } from '../lib/share';
import LogContext from '../contexts/LogContext';
import { postLogEvent } from '../lib/feed';
import { WidgetContainer } from './widgets/common';
import { LogEvent, Origin } from '../lib/log';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';
import { Squad } from '../graphql/sources';
import { SocialShareButton } from './widgets/SocialShareButton';
import { SquadsToShare } from './squads/SquadsToShare';
import { ButtonSize, ButtonVariant } from './buttons/common';
import { useGetShortUrl } from '../hooks';
import { ReferralCampaignKey } from '../lib';
import { ProfileImageSize } from './ProfilePicture';

interface ShareBarProps {
  post: Post;
}

export default function ShareBar({ post }: ShareBarProps): ReactElement {
  const href = post.commentsPermalink;
  const cid = ReferralCampaignKey.SharePost;
  const { getShortUrl } = useGetShortUrl();
  const [copying, copyLink] = useCopyPostLink();
  const { logEvent } = useContext(LogContext);
  const { openModal } = useLazyModal();

  const logShareEvent = (provider: ShareProvider) =>
    logEvent(
      postLogEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );

  const onClick = async (provider: ShareProvider) => {
    logShareEvent(provider);

    const shortLink = await getShortUrl(href, cid);
    const shareLink = getShareLink({
      provider,
      link: shortLink,
      text: post?.title,
    });
    window.open(shareLink, '_blank');
  };

  const logAndCopyLink = async () => {
    const shortLink = await getShortUrl(href, cid);
    copyLink({ link: shortLink });
    logShareEvent(ShareProvider.CopyLink);
  };

  const onShareToSquad = (squad: Squad) => {
    logEvent(postLogEvent(LogEvent.StartShareToSquad, post));
    openModal({
      type: LazyModal.CreateSharedPost,
      props: {
        squad,
        preview: post,
        onSharedSuccessfully: () =>
          logEvent(postLogEvent(LogEvent.ShareToSquad, post)),
      },
    });
  };

  return (
    <WidgetContainer className="hidden flex-col p-3 laptop:flex">
      <p className="mb-4 text-text-tertiary typo-callout">
        Would you recommend this post?
      </p>
      <div className="grid grid-cols-4 gap-2 gap-y-4">
        <SocialShareButton
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          onClick={logAndCopyLink}
          pressed={copying}
          icon={
            <CopyIcon
              className={copying && 'text-accent-avocado-default'}
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
          squadAvatarSize={ProfileImageSize.Large}
          onClick={(_, squad) => onShareToSquad(squad)}
        />
      </div>
    </WidgetContainer>
  );
}
