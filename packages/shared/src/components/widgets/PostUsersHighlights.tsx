import React, { ReactElement } from 'react';
import { Post } from '../../graphql/posts';
import classed from '../../lib/classed';
import { LazyImage } from '../LazyImage';
import { WidgetContainer } from './common';
import FeatherIcon from '../../../icons/feather.svg';
import HunterIcon from '../../../icons/hunter.svg';

interface PostAuthorProps {
  post: Post;
}

type UserType = 'source' | 'author' | 'featured';

const SourceImage = classed(LazyImage, 'w-8 h-8 rounded-full');

interface SourceAuthorProps {
  image: string;
  name: string;
  username?: string;
  userType?: UserType;
}

const getUserIcon = (userType: UserType) => {
  if (userType === 'source') return null;

  return userType === 'author' ? FeatherIcon : HunterIcon;
};

const UserHighlight = ({
  image,
  name,
  username,
  userType = 'source',
}: SourceAuthorProps) => {
  const Icon = getUserIcon(userType);

  return (
    <div className="flex relative flex-row p-3">
      <SourceImage
        className="cursor-pointer"
        imgSrc={image}
        imgAlt={name}
        background="var(--theme-background-secondary)"
      />
      {Icon && <Icon className="absolute top-10 left-10" />}
      <div className="flex flex-col">
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
      <UserHighlight {...source} />
      {author && <UserHighlight {...author} />}
      {featuredComments?.map((comment) => (
        <UserHighlight key={comment.id} {...comment.author} />
      ))}
    </WidgetContainer>
  );
}
