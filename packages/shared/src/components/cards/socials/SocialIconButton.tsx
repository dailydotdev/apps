import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ButtonVariant } from '../../buttons/Button';
import type { Post } from '../../../graphql/posts';
import {
  LinkedInIcon,
  RedditIcon,
  TwitterIcon,
  WhatsappIcon,
} from '../../icons';
import { SocialIconType } from '../../../lib/socialMedia';
import { useLogContext } from '../../../contexts/LogContext';
import { Origin } from '../../../lib/log';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ReferralCampaignKey } from '../../../lib';
import { getShortLinkProps } from '../../../hooks';
import { postLogEvent } from '../../../lib/feed';
import { ActiveFeedContext } from '../../../contexts';

type SocialShareButtonProps = {
  post: Post;
  platform: SocialIconType;
  variant?: ButtonVariant;
};

const getBtnProps = ({
  post,
  platform,
  link,
}: {
  post: Post;
  platform: string;
  link: string;
}) => {
  const commonProps = {
    target: '_blank',
    rel: 'noopener noreferrer',
  };

  const title = post?.title || post?.sharedPost?.title;

  switch (platform) {
    case SocialIconType.Reddit:
      return {
        ...commonProps,
        href: `https://www.reddit.com/submit?url=${encodeURIComponent(
          link,
        )}&title=${encodeURIComponent(title)}`,
        icon: <RedditIcon secondary />,
      };
    case SocialIconType.X:
      return {
        ...commonProps,
        href: `https://x.com/share?url=${encodeURIComponent(
          link,
        )}&text=${encodeURIComponent(title)}`,
        icon: <TwitterIcon />,
      };
    case SocialIconType.LinkedIn:
      return {
        ...commonProps,
        href: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
          link,
        )}&title=${encodeURIComponent(title)}`,
        icon: <LinkedInIcon secondary />,
      };
    case SocialIconType.WhatsApp:
      return {
        ...commonProps,
        href: `https://wa.me/?text=${encodeURIComponent(link)}`,
        icon: <WhatsappIcon color="white" secondary />,
      };
    default:
      return {};
  }
};

const SocialIconButton = ({
  post,
  platform,
  variant = ButtonVariant.Float,
}: SocialShareButtonProps): ReactElement => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { queryKey: linkKey } = getShortLinkProps(
    post?.commentsPermalink,
    ReferralCampaignKey.SharePost,
    user,
  );
  const { logEvent } = useLogContext();
  const { logOpts } = useContext(ActiveFeedContext);
  const linkData = queryClient.getQueryData<string | undefined>(linkKey);

  return (
    <Button
      variant={variant}
      tag="a"
      onClick={() =>
        logEvent(
          postLogEvent('share post', post, {
            extra: {
              provider: platform,
              origin: Origin.Suggestions,
            },
            ...(logOpts && logOpts),
          }),
        )
      }
      {...getBtnProps({
        post,
        platform,
        link: linkData || post.commentsPermalink,
      })}
    />
  );
};

export default SocialIconButton;
