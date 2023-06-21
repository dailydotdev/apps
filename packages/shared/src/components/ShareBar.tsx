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
import { Button } from './buttons/Button';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import { SimpleTooltip } from './tooltips/SimpleTooltip';
import { WidgetContainer } from './widgets/common';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { useAuthContext } from '../contexts/AuthContext';
import { useCreateSquadModal } from '../hooks/useCreateSquadModal';
import FeaturesContext from '../contexts/FeaturesContext';
import SourceProfilePicture from './profile/SourceProfilePicture';
import { LazyModal } from './modals/common/types';
import { useLazyModal } from '../hooks/useLazyModal';
import { verifyPermission } from '../graphql/squads';
import { Squad, SourcePermissions } from '../graphql/sources';
import PlusIcon from './icons/Plus';
import { IconSize } from './Icon';

export default function ShareBar({ post }: { post: Post }): ReactElement {
  const href = post.commentsPermalink;
  const [copying, copyLink] = useCopyPostLink(href);
  const { trackEvent } = useContext(AnalyticsContext);
  const { squads } = useAuthContext();
  const { hasSquadAccess, isFlagsFetched } = useContext(FeaturesContext);
  const { openModal } = useLazyModal();
  const { openNewSquadModal } = useCreateSquadModal({
    hasSquads: !!squads?.length,
    hasAccess: hasSquadAccess,
    isFlagsFetched,
  });

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
          return trackEvent(postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post));
        },
      },
    });
  };

  return (
    <WidgetContainer className="hidden laptop:flex flex-col p-3">
      <p className="mb-4 typo-callout text-theme-label-tertiary">
        Would you recommend this post?
      </p>

      <div className="flex flex-wrap gap-2">
        <SimpleTooltip content="Copy link">
          <Button
            className="flex-col font-normal text-center text-salt-90 border-0 share btn-tertiary-avocado typo-caption1"
            onClick={trackAndCopyLink}
            pressed={copying}
            textPosition="justify-between"
            icon={<CopyIcon secondary className="mt-1.5 mb-3" />}
          >
            Copy link
          </Button>
        </SimpleTooltip>

        <SimpleTooltip content="Share on WhatsApp">
          <Button
            className="flex-col font-normal text-center text-salt-90 border-0 share btn-tertiary typo-caption1"
            tag="a"
            href={getWhatsappShareLink(href)}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(ShareProvider.WhatsApp)}
            textPosition="justify-between"
            icon={<WhatsappIcon secondary className="mt-1.5 mb-3 text-white" />}
          >
            WhatsApp
          </Button>
        </SimpleTooltip>

        <SimpleTooltip content="Share on Facebook">
          <Button
            className="flex-col font-normal text-center text-salt-90 border-0 share btn-tertiary typo-caption1"
            tag="a"
            href={getFacebookShareLink(href)}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(ShareProvider.Facebook)}
            textPosition="justify-start"
            icon={<FacebookIcon secondary className="mt-1.5 mb-3 text-white" />}
          >
            Facebook
          </Button>
        </SimpleTooltip>

        <SimpleTooltip content="Share on Twitter">
          <Button
            className="flex-col font-normal text-center text-salt-90 border-0 share btn-tertiary typo-caption1"
            tag="a"
            href={getTwitterShareLink(href, post.title)}
            target="_blank"
            rel="noopener"
            onClick={() => onClick(ShareProvider.Twitter)}
            textPosition="justify-start"
            icon={<TwitterIcon secondary className="mt-1.5 mb-3 text-white" />}
          >
            Twitter
          </Button>
        </SimpleTooltip>

        {squads
          ?.filter(
            (squadItem) =>
              squadItem.active &&
              verifyPermission(squadItem, SourcePermissions.Post),
          )
          ?.map((squad) => (
            <SimpleTooltip content={`Share on ${squad.name}`} key={squad.id}>
              <Button
                className="flex-col font-normal text-center text-salt-90 border-0 share btn-tertiary typo-caption1"
                key={squad.id}
                onClick={() => onShareToSquad(squad)}
                textPosition="justify-between"
                icon={
                  <SourceProfilePicture
                    source={squad}
                    className="mt-1.5 mb-3 squad"
                  />
                }
              >
                <div className="truncate">@{squad.handle}</div>
              </Button>
            </SimpleTooltip>
          ))}

        {hasSquadAccess && squads?.length === 0 && (
          <SimpleTooltip content="Create new squad">
            <Button
              className="flex-col font-normal text-center text-salt-90 border-0 share btn-tertiary typo-caption1"
              onClick={() =>
                openNewSquadModal({
                  origin: Origin.Share,
                  redirectAfterCreate: false,
                })
              }
              textPosition="justify-between"
              icon={
                <div className="flex justify-center items-center mt-1.5 mb-3 rounded-full squad bg-theme-color-cabbage">
                  <PlusIcon size={IconSize.Small} className="text-pepper-90" />
                </div>
              }
            >
              New squad
            </Button>
          </SimpleTooltip>
        )}
      </div>
    </WidgetContainer>
  );
}
