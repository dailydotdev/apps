import type { ReactElement } from 'react';
import React, { useContext } from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Image } from '../image/Image';
import { fallbackImages } from '../../lib/config';
import { FollowButton } from '../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../hooks/contentPreference/useContentPreferenceStatusQuery';
import AuthContext from '../../contexts/AuthContext';
import { ButtonVariant } from '../buttons/Button';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export interface ExploreEntityCardProps {
  entityId: string;
  entityType: ContentPreferenceType;
  entityName: string;
  name: string;
  image?: string;
  handle?: string;
  bio?: string;
  permalink: string;
  // Users only — surfaces the reputation badge like the profile tooltip.
  reputation?: number;
}

// A single card shared by "Who to follow" (users) and "Top sources" (sources):
// avatar + name + handle + bio, with a full-width Follow button pinned to the
// bottom so every card lines up regardless of bio length.
export function ExploreEntityCard({
  entityId,
  entityType,
  entityName,
  name,
  image,
  handle,
  bio,
  permalink,
  reputation,
}: ExploreEntityCardProps): ReactElement {
  const { user: loggedUser } = useContext(AuthContext);
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: entityId,
    entity: entityType,
  });
  const isUser = entityType === ContentPreferenceType.User;
  const isSelf = isUser && loggedUser?.id === entityId;

  return (
    <article className="flex h-full w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <Link href={permalink} passHref prefetch={false}>
        <a className="flex items-center gap-3 no-underline">
          <Image
            src={image || fallbackImages.avatar}
            alt={isUser ? `${name}'s avatar` : `${name} logo`}
            className={classNames(
              'size-12 shrink-0 object-cover',
              isUser ? 'rounded-full' : 'rounded-12',
            )}
          />
          <span className="flex min-w-0 flex-col">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              bold
              truncate
            >
              {name}
            </Typography>
            {handle && (
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                truncate
              >
                @{handle}
              </Typography>
            )}
          </span>
        </a>
      </Link>
      {isUser && typeof reputation === 'number' && (
        <ReputationUserBadge
          user={{ reputation }}
          iconProps={{ size: IconSize.Size16 }}
        />
      )}
      {bio && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="line-clamp-2"
        >
          {bio}
        </Typography>
      )}
      {!isSelf && (
        <FollowButton
          className="mt-auto w-full"
          buttonClassName="w-full justify-center"
          entityId={entityId}
          entityName={entityName}
          status={contentPreference?.status}
          type={entityType}
          variant={ButtonVariant.Primary}
          followedVariant={ButtonVariant.Secondary}
          showSubscribe={false}
          alwaysShow
        />
      )}
    </article>
  );
}
