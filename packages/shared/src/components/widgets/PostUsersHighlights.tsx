import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { LazyImage } from '../LazyImage';
import { WidgetContainer } from './common';
import FeatherIcon from '../icons/Feather';
import ScoutIcon from '../icons/Scout';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileLink } from '../profile/ProfileLink';
import { Author } from '../../graphql/comments';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import ConditionalWrapper from '../ConditionalWrapper';

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
          className="rounded-full cursor-pointer"
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
  const { id, handle, name, username, permalink, userType = 'source' } = props;
  const Icon = getUserIcon(userType);
  const userTypeNotSource = userType === 'source';

  return (
    <div className="flex relative flex-row p-3">
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
            'absolute w-5 h-5 top-10 left-10',
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
        <div className="flex flex-col ml-4">
          <ProfileLink className="font-bold typo-callout" href={permalink}>
            {name}
          </ProfileLink>
          {(handle || username || id) && (
            <ProfileLink
              className="mt-0.5 typo-footnote text-theme-label-tertiary"
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
