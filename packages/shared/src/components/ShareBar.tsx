import React, { ReactElement, useContext } from 'react';

import LogContext from '../contexts/LogContext';
import { Post } from '../graphql/posts';
import { Squad } from '../graphql/sources';
import { useGetShortUrl } from '../hooks';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { useLazyModal } from '../hooks/useLazyModal';
import { ReferralCampaignKey } from '../lib';
import { postLogEvent } from '../lib/feed';
import { LogEvent, Origin } from '../lib/log';
import { getShareLink, ShareProvider } from '../lib/share';
import { ButtonSize, ButtonVariant } from './buttons/common';
import { CopyIcon, FacebookIcon, TwitterIcon, WhatsappIcon } from './icons';
import { LazyModal } from './modals/common/types';
import { ProfileImageSize } from './ProfilePicture';
import { SquadsToShare } from './squads/SquadsToShare';
import { WidgetContainer } from './widgets/common';
import { SocialShareButton } from './widgets/SocialShareButton';

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
