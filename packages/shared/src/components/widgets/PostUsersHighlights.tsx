import React, { ReactElement, useMemo } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { LazyImage } from '../LazyImage';
import { WidgetContainer } from './common';
import { ScoutIcon, FeatherIcon } from '../icons';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileLink } from '../profile/ProfileLink';
import { Author as CommentAuthor } from '../../graphql/comments';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ConditionalWrapper from '../ConditionalWrapper';
import { ReputationUserBadge } from '../ReputationUserBadge';
import { SourceSubscribeButton } from '../sources';
import { ButtonVariant } from '../buttons/common';
import useFeedSettings from '../../hooks/useFeedSettings';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../lib/analytics';
import { useSourceSubscription } from '../../hooks';

interface PostAuthorProps {
  post: Post;
}

enum UserType {
  Source = 'source',
  Author = 'author',
  Featured = 'featured',
  Scout = 'scout',
}

const StyledImage = classed(LazyImage, 'w-10 h-10');

interface SourceAuthorProps {
  id?: string;
  handle?: string;
  image: string;
  name: string;
  username?: string;
  userType?: UserType;
  permalink: string;
  reputation?: number;
}

const getUserIcon = (userType: UserType) => {
  if (userType === UserType.Source) {
    return null;
  }

  return userType === UserType.Author ? FeatherIcon : ScoutIcon;
};

const Image = (props: SourceAuthorProps) => {
  const { userType, name, permalink, image } = props;

  if (userType === UserType.Source) {
    return (
      <LinkWithTooltip
        href={permalink}
        passHref
        prefetch={false}
        tooltip={{
          placement: 'bottom',
          content: name,
        }}
      >
        <StyledImage
          className="cursor-pointer rounded-full"
          imgSrc={image}
          imgAlt={name}
          background="var(--theme-background-subtle)"
        />
      </LinkWithTooltip>
    );
  }

  const user = props as CommentAuthor;

  return (
    <ProfileLink href={user.permalink} data-testid="authorLink">
      <StyledImage
        className="rounded-12"
        imgSrc={image}
        imgAlt={name}
        background="var(--theme-background-subtle)"
      />
    </ProfileLink>
  );
};

const UserHighlight = (props: SourceAuthorProps) => {
  const {
    id,
    handle,
    name,
    username,
    permalink,
    userType = UserType.Source,
    reputation,
  } = props;
  const Icon = getUserIcon(userType);
  const isUserTypeSource = userType === UserType.Source;
  const { feedSettings } = useFeedSettings();

  const isSourceBlocked = useMemo(() => {
    if (!isUserTypeSource) {
      return false;
    }

    return !!feedSettings?.excludeSources?.some(
      (excludedSource) => excludedSource.id === id,
    );
  }, [isUserTypeSource, feedSettings?.excludeSources, id]);

  return (
    <div className="relative flex flex-row items-center p-3">
      <ConditionalWrapper
        condition={!isUserTypeSource}
        wrapper={(children) => (
          <ProfileTooltip user={{ id }}>
            {children as ReactElement}
          </ProfileTooltip>
        )}
      >
        <ProfileLink href={permalink}>
          <Image {...props} />
        </ProfileLink>
      </ConditionalWrapper>
      {Icon && (
        <Icon
          secondary
          className={classNames(
            'absolute left-10 top-10 h-5 w-5',
            userType === UserType.Author
              ? 'text-accent-cheese-default'
              : 'text-accent-bun-default',
          )}
        />
      )}
      <ConditionalWrapper
        condition={!isUserTypeSource}
        wrapper={(children) => (
          <ProfileTooltip user={{ id }}>
            {children as ReactElement}
          </ProfileTooltip>
        )}
      >
        <div className="ml-4 flex min-w-0 flex-1 flex-col">
          {isUserTypeSource && (
            <ProfileLink
              className={classNames('!block truncate font-bold typo-callout')}
              href={permalink}
            >
              {name}
            </ProfileLink>
          )}
          {!isUserTypeSource && (
            <div className="flex">
              <ProfileLink className="font-bold typo-callout" href={permalink}>
                {name}
              </ProfileLink>
              <ReputationUserBadge user={{ reputation }} />
            </div>
          )}
          {(handle || username || id) && (
            <ProfileLink
              className="mt-0.5 !block truncate text-text-tertiary typo-footnote"
              href={permalink}
            >
              @{handle || username || id}
            </ProfileLink>
          )}
        </div>
      </ConditionalWrapper>
      {!isSourceBlocked && isUserTypeSource && (
        <SourceSubscribeButton
          className="ml-2"
          variant={ButtonVariant.Secondary}
          source={{ id }}
        />
      )}
    </div>
  );
};

const EnableNotificationSourceSubscribe = ({
  source,
}: Pick<Post, 'source'>) => {
  const { isSubscribed } = useSourceSubscription({
    source,
  });

  if (!isSubscribed) {
    return null;
  }

  return (
    <EnableNotification
      source={NotificationPromptSource.SourceSubscribe}
      contentName={source.name}
    />
  );
};

export function PostUsersHighlights({ post }: PostAuthorProps): ReactElement {
  const { author, scout, source } = post;

  return (
    <WidgetContainer className="flex flex-col">
      <UserHighlight {...source} userType={UserType.Source} />
      <EnableNotificationSourceSubscribe source={source} />
      {author && <UserHighlight {...author} userType={UserType.Author} />}
      {scout && <UserHighlight {...scout} userType={UserType.Scout} />}
    </WidgetContainer>
  );
}
