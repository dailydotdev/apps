import type { ReactElement } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import { CopyIcon, FacebookIcon, TwitterIcon, WhatsappIcon } from './icons';
import type { Post } from '../graphql/posts';
import { useCopyPostLink } from '../hooks/useCopyPostLink';
import { getShareLink, ShareProvider } from '../lib/share';
import { useLogContext } from '../contexts/LogContext';
import { postLogEvent } from '../lib/feed';
import { ActiveFeedContext } from '../contexts';
import { WidgetContainer } from './widgets/common';
import { LogEvent, Origin } from '../lib/log';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';
import type { Squad } from '../graphql/sources';
import { SocialShareButton } from './widgets/SocialShareButton';
import { getShareableSquads, SquadsToShare } from './squads/SquadsToShare';
import { Button } from './buttons/Button';
import { ButtonSize, ButtonVariant } from './buttons/common';
import { useGetShortUrl } from '../hooks';
import { ReferralCampaignKey } from '../lib';
import { ProfileImageSize } from './ProfilePicture';
import { useAuthContext } from '../contexts/AuthContext';

interface ShareBarProps {
  post: Post;
}

export default function ShareBar({ post }: ShareBarProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const href = post.commentsPermalink;
  const cid = ReferralCampaignKey.SharePost;
  const { getShortUrl } = useGetShortUrl();
  const [copying, copyLink] = useCopyPostLink();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { logOpts } = useContext(ActiveFeedContext);
  const { squads } = useAuthContext();

  const visibleRows = 2;
  const columns = 4;
  const fixedOptions = 4;
  const maxVisibleOptions = visibleRows * columns;
  const maxVisibleSquadsWhenCollapsed = maxVisibleOptions - fixedOptions;

  const shareableSquadsCount = useMemo(
    () => getShareableSquads(squads).length,
    [squads],
  );
  const squadOptionsCount = shareableSquadsCount || 1;
  const totalOptionsCount = fixedOptions + squadOptionsCount;
  const shouldShowToggle = totalOptionsCount > maxVisibleOptions;

  const logShareEvent = (provider: ShareProvider) =>
    logEvent(
      postLogEvent(LogEvent.SharePost, post, {
        extra: { provider, origin: Origin.ShareBar },
        ...(logOpts && logOpts),
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
      <h4 className="mb-4 font-bold text-text-primary typo-callout">
        Would you recommend this post?
      </h4>
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
          maxItems={isExpanded ? undefined : maxVisibleSquadsWhenCollapsed}
          onClick={(_, squad) => onShareToSquad(squad)}
        />
      </div>
      {shouldShowToggle && (
        <Button
          className="mt-3 w-full"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          size={ButtonSize.Small}
          variant={ButtonVariant.Subtle}
        >
          {isExpanded ? 'Show fewer options' : 'Show more options'}
        </Button>
      )}
    </WidgetContainer>
  );
}
