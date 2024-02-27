import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { LazyImage } from '../LazyImage';
import { WidgetContainer } from './common';
import { ScoutIcon, FeatherIcon } from '../icons';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileLink } from '../profile/ProfileLink';
import { Author } from '../../graphql/comments';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ConditionalWrapper from '../ConditionalWrapper';
import { ReputationUserBadge } from '../ReputationUserBadge';

interface PostAuthorProps {
  post: Post;
}

type UserType = 'source' | 'author' | 'featured' | 'scout';

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
  if (userType === 'source') {
    return null;
  }

  return userType === 'author' ? FeatherIcon : ScoutIcon;
};

const Image = (props: SourceAuthorProps) => {
  const { userType, name, permalink, image } = props;

  if (userType === 'source') {
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
          background="var(--theme-background-secondary)"
        />
      </LinkWithTooltip>
    );
  }

  const user = props as Author;

  return (
    <ProfileLink href={user.permalink} data-testid="authorLink">
      <StyledImage
        className="rounded-12"
        imgSrc={image}
        imgAlt={name}
        background="var(--theme-background-secondary)"
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
    userType = 'source',
    reputation,
  } = props;
  const Icon = getUserIcon(userType);
  const userTypeNotSource = userType !== 'source';

  return (
    <div className="relative flex flex-row p-3">
      <ConditionalWrapper
        condition={userTypeNotSource}
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
            userType === 'author'
              ? 'text-theme-color-cheese'
              : 'text-theme-color-bun',
          )}
        />
      )}
      <ConditionalWrapper
        condition={userTypeNotSource}
        wrapper={(children) => (
          <ProfileTooltip user={{ id }}>
            {children as ReactElement}
          </ProfileTooltip>
        )}
      >
        <div className="ml-4 flex flex-col">
          <div className="flex">
            <ProfileLink className="font-bold typo-callout" href={permalink}>
              {name}
            </ProfileLink>
            <ReputationUserBadge user={{ reputation }} />
          </div>
          {(handle || username || id) && (
            <ProfileLink
              className="mt-0.5 text-theme-label-tertiary typo-footnote"
              href={permalink}
            >
              @{handle || username || id}
            </ProfileLink>
          )}
        </div>
      </ConditionalWrapper>
    </div>
  );
};

export function PostUsersHighlights({ post }: PostAuthorProps): ReactElement {
  const { author, scout, source } = post;

  return (
    <WidgetContainer className="flex flex-col">
      <UserHighlight {...source} userType="source" />
      {author && <UserHighlight {...author} userType="author" />}
      {scout && <UserHighlight {...scout} userType="scout" />}
    </WidgetContainer>
  );
}
