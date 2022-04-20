import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { LazyImage } from '../LazyImage';
import { WidgetContainer } from './common';
import FeatherIcon from '../../../icons/feather.svg';
import HunterIcon from '../../../icons/hunter.svg';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileLink } from '../profile/ProfileLink';
import { Author } from '../../graphql/comments';
import { ProfileTooltip } from '../profile/ProfileTooltip';

interface PostAuthorProps {
  post: Post;
}

type UserType = 'source' | 'author' | 'featured';

const StyledImage = classed(LazyImage, 'w-10 h-10');

interface SourceAuthorProps {
  id?: string;
  image: string;
  name: string;
  username?: string;
  userType?: UserType;
  permalink: string;
}

const getUserIcon = (userType: UserType) => {
  if (userType === 'source') return null;

  return userType === 'author' ? FeatherIcon : HunterIcon;
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
    <ProfileLink user={user} data-testid="authorLink">
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
  const { id, name, username, userType = 'source' } = props;
  const Icon = getUserIcon(userType);
  const LinkWrapper = userType === 'source' ? React.Fragment : ProfileTooltip;

  return (
    <div className="flex relative flex-row p-3">
      <LinkWrapper user={{ id }}>
        <ProfileLink user={props}>
          <Image {...props} />
        </ProfileLink>
      </LinkWrapper>
      {Icon && (
        <Icon
          className={classNames(
            'absolute w-5 h-5 top-11 left-11',
            userType === 'author'
              ? 'top-11 left-11 text-theme-color-cheese'
              : 'top-10 left-10 text-theme-color-bun',
          )}
        />
      )}
      <LinkWrapper user={{ id }}>
        <div className="flex flex-col ml-4">
          <ProfileLink className="font-bold typo-callout" user={props}>
            {name}
          </ProfileLink>
          {(username || id) && (
            <ProfileLink
              className="mt-0.5 typo-footnote text-theme-label-tertiary"
              user={props}
            >
              @{username || id}
            </ProfileLink>
          )}
        </div>
      </LinkWrapper>
    </div>
  );
};

export function PostUsersHighlights({ post }: PostAuthorProps): ReactElement {
  const { author, source } = post;

  return (
    <WidgetContainer className="flex flex-col">
      <UserHighlight
        {...source}
        permalink={`/sources/${source.id}`}
        userType="source"
      />
      {author && <UserHighlight {...author} userType="author" />}
    </WidgetContainer>
  );
}
