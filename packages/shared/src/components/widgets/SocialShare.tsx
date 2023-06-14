import React, { ReactElement, useContext } from 'react';
import {
  getEmailShareLink,
  getFacebookShareLink,
  getLinkedInShareLink,
  getRedditShareLink,
  getTelegramShareLink,
  getTwitterShareLink,
  getWhatsappShareLink,
  ShareProvider,
} from '../../lib/share';
import { ShareText, SocialShareIcon } from './SocialShareIcon';
import { Post } from '../../graphql/posts';
import MailIcon from '../icons/Mail';
import TwitterIcon from '../icons/Twitter';
import WhatsappIcon from '../icons/Whatsapp';
import FacebookIcon from '../icons/Facebook';
import RedditIcon from '../icons/Reddit';
import LinkedInIcon from '../icons/LinkedIn';
import TelegramIcon from '../icons/Telegram';
import { FeedItemPosition, postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Comment, getCommentHash } from '../../graphql/comments';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { SourcePermissions, Squad as SquadType } from '../../graphql/sources';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { verifyPermission } from '../../graphql/squads';
import { useCreateSquadModal } from '../../hooks/useCreateSquadModal';
import FeaturesContext from '../../contexts/FeaturesContext';
import PlusIcon from '../icons/Plus';
import { IconSize } from '../Icon';
import { useSharePost } from '../../hooks/useSharePost';
import MenuIcon from '../icons/Menu';

export enum SocialShareType {
  Squad = 'squad',
  External = 'external',
}

interface SocialShareProps {
  origin: Origin;
  post: Post;
  comment?: Comment;
  onSquadShare?: (post: Post) => void;
  type?: SocialShareType;
}

export const SocialShare = ({
  post,
  comment,
  origin,
  columns,
  column,
  row,
  onSquadShare,
  type = SocialShareType.External,
}: SocialShareProps & FeedItemPosition): ReactElement => {
  const { squads } = useAuthContext();
  const isComment = !!comment;
  const { openModal } = useLazyModal();
  const link = isComment
    ? `${post?.commentsPermalink}${getCommentHash(comment.id)}`
    : post?.commentsPermalink;
  const { trackEvent } = useContext(AnalyticsContext);
  const { hasSquadAccess, isFlagsFetched } = useContext(FeaturesContext);
  const { openNewSquadModal } = useCreateSquadModal({
    hasSquads: !!squads?.length,
    hasAccess: hasSquadAccess,
    isFlagsFetched,
  });
  const { openNativeSharePost } = useSharePost(Origin.Share);
  const trackClick = (provider: ShareProvider) =>
    trackEvent(
      postAnalyticsEvent('share post', post, {
        columns,
        column,
        row,
        extra: { provider, origin, ...(comment && { commentId: comment.id }) },
      }),
    );

  const onShareToSquad = (squad: SquadType) => {
    trackEvent(postAnalyticsEvent(AnalyticsEvent.StartShareToSquad, post));
    openModal({
      type: LazyModal.PostToSquad,
      props: {
        squad,
        preview: post,
        onSharedSuccessfully: () => {
          trackEvent(postAnalyticsEvent(AnalyticsEvent.ShareToSquad, post));
          return onSquadShare;
        },
      },
    });
  };

  return (
    <>
      {hasSquadAccess &&
        type === SocialShareType.Squad &&
        !isComment &&
        !post.private && (
          <>
            <p className="py-2.5 font-bold typo-callout">
              Share with your squad
            </p>
            <section className="grid grid-cols-5 gap-4 pt-2 w-fit">
              {squads
                ?.filter(
                  (squadItem) =>
                    squadItem.active &&
                    verifyPermission(squadItem, SourcePermissions.Post),
                )
                ?.map((squad) => (
                  <button
                    type="button"
                    className="flex flex-col items-center w-16 text-center"
                    key={squad.id}
                    onClick={() => onShareToSquad(squad)}
                  >
                    <SourceProfilePicture source={squad} />
                    <ShareText className="mt-2 break-words">
                      @{squad.handle}
                    </ShareText>
                  </button>
                ))}
              {hasSquadAccess &&
                type === SocialShareType.Squad &&
                !isComment &&
                squads?.length === 0 && (
                  <button
                    type="button"
                    className="flex flex-col items-center w-16 text-center"
                    onClick={() =>
                      openNewSquadModal({
                        origin: Origin.Share,
                        redirectAfterCreate: false,
                      })
                    }
                  >
                    <div className="flex justify-center items-center w-12 h-12 bg-cabbage-40 rounded-full">
                      <PlusIcon
                        size={IconSize.Large}
                        className="text-pepper-90"
                      />
                    </div>

                    <ShareText className="mt-2 break-words">
                      New squad
                    </ShareText>
                  </button>
                )}
            </section>
          </>
        )}

      {type === SocialShareType.External && (
        <>
          <p className="py-2.5 font-bold typo-callout">Share externally</p>
          <section className="grid grid-cols-5 gap-4 pt-2 w-fit">
            <SocialShareIcon
              href={getTwitterShareLink(link, post?.title)}
              icon={<TwitterIcon />}
              className="bg-theme-bg-twitter"
              onClick={() => trackClick(ShareProvider.Twitter)}
              label="Twitter"
            />
            <SocialShareIcon
              href={getWhatsappShareLink(link)}
              icon={<WhatsappIcon />}
              onClick={() => trackClick(ShareProvider.WhatsApp)}
              className="bg-theme-bg-whatsapp"
              label="WhatsApp"
            />
            <SocialShareIcon
              href={getFacebookShareLink(link)}
              icon={<FacebookIcon />}
              className="bg-theme-bg-facebook"
              onClick={() => trackClick(ShareProvider.Facebook)}
              label="Facebook"
            />
            <SocialShareIcon
              href={getRedditShareLink(link, post?.title)}
              icon={<RedditIcon />}
              className="bg-theme-bg-reddit"
              onClick={() => trackClick(ShareProvider.Reddit)}
              label="Reddit"
            />
            <SocialShareIcon
              href={getLinkedInShareLink(link)}
              icon={<LinkedInIcon />}
              className="bg-theme-bg-linkedin"
              onClick={() => trackClick(ShareProvider.LinkedIn)}
              label="LinkedIn"
            />
            <SocialShareIcon
              href={getTelegramShareLink(link, post?.title)}
              icon={<TelegramIcon />}
              className="bg-theme-bg-telegram"
              onClick={() => trackClick(ShareProvider.Telegram)}
              label="Telegram"
            />
            <SocialShareIcon
              href={getEmailShareLink(link, 'I found this amazing post')}
              icon={<MailIcon />}
              className="bg-theme-bg-email"
              onClick={() => trackClick(ShareProvider.Email)}
              label="Email"
            />
            {'share' in navigator && (
              <SocialShareIcon
                icon={<MenuIcon className="rotate-90" />}
                className="bg-theme-bg-email"
                onClick={() => openNativeSharePost(post)}
                label="Share via..."
              />
            )}
          </section>
        </>
      )}
    </>
  );
};
