import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { LazyImage } from '../LazyImage';
import { WidgetContainer } from './common';
import FeatherIcon from '../../../icons/feather.svg';
import HunterIcon from '../../../icons/hunter.svg';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { ProfileLink } from '../profile/ProfileLink';
import { Author } from '../../graphql/comments';

interface PostAuthorProps {
  post: Post;
}

type UserType = 'source' | 'author' | 'featured';

const StyledImage = classed(LazyImage, 'w-8 h-8 rounded-full');

interface SourceAuthorProps {
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
          className="cursor-pointer"
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
        imgSrc={image}
        imgAlt={name}
        background="var(--theme-background-secondary)"
      />
    </ProfileLink>
  );
};

const UserHighlight = (props: SourceAuthorProps) => {
  const { name, username, userType = 'source' } = props;
  const Icon = getUserIcon(userType);

  return (
    <div className="flex relative flex-row p-3">
      <Image {...props} />
      {Icon && <Icon className="absolute top-10 left-10" />}
      <div className="flex flex-col ml-4">
        {name && <span className="font-bold typo-callout">{name}</span>}
        {username && (
          <span className="mt-0.5 typo-footnote text-theme-label-tertiary">
            {username}
          </span>
        )}
      </div>
    </div>
  );
};

export function PostUsersHighlights({ post }: PostAuthorProps): ReactElement {
  const { author, source, featuredComments } = post;

  return (
    <WidgetContainer className="flex flex-col">
      <UserHighlight
        {...source}
        permalink={`/sources/${source.id}`}
        userType="source"
      />
      {author && <UserHighlight {...author} userType="author" />}
      {featuredComments?.map((comment) => (
        <UserHighlight
          key={comment.id}
          {...comment.author}
          userType="featured"
        />
      ))}
    </WidgetContainer>
  );
}
