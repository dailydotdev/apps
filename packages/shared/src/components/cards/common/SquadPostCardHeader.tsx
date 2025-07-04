import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import type { Post } from '../../../graphql/posts';
import { ProfileImageSize } from '../../ProfilePicture';
import SourceButton from './SourceButton';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from './BookmarkProviderHeader';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { useBookmarkProvider } from '../../../hooks';
import type { UserShortProfile } from '../../../lib/user';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { isSourceUserSource } from '../../../graphql/sources';

const UserEntityCard = dynamic(
  /* webpackChunkName: "userEntityCard" */ () =>
    import('../entity/UserEntityCard'),
);

const HoverCard = dynamic(
  /* webpackChunkName: "hoverCard" */ () => import('./HoverCard'),
);

type SquadPostCardHeaderProps = { post: Post; enableSourceHeader?: boolean };

export const SquadPostCardHeader = ({
  post,
  enableSourceHeader = false,
}: SquadPostCardHeaderProps): ReactElement => {
  const { author, source, bookmarked } = post;
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked,
  });
  const isUserSource = isSourceUserSource(post.source);

  return (
    <>
      {highlightBookmarkedPost && (
        <BookmakProviderHeader
          className={classNames(
            'relative my-2 flex py-2',
            enableSourceHeader ? 'h-10' : 'h-12',
          )}
        />
      )}
      <div
        className={classNames(
          'relative m-2 mt-3 flex gap-2',
          highlightBookmarkedPost && headerHiddenClassName,
        )}
      >
        <div className="relative flex w-full flex-row gap-2">
          {!isUserSource && (
            <SourceButton
              source={source}
              className={classNames(
                'z-0',
                !enableSourceHeader && 'absolute -bottom-2 -right-2',
              )}
              size={
                !!author || enableSourceHeader
                  ? ProfileImageSize.Medium
                  : ProfileImageSize.XSmall
              }
            />
          )}
          {author && (
            <HoverCard
              align="start"
              side="bottom"
              sideOffset={10}
              trigger={
                <ProfileImageLink
                  picture={{ size: ProfileImageSize.Medium }}
                  user={author}
                />
              }
            >
              <UserEntityCard user={author as UserShortProfile} />
            </HoverCard>
          )}
          <div className="flex flex-1" />
          <PostOptionButton
            post={post}
            triggerClassName="laptop:mouse:invisible laptop:mouse:group-hover:visible"
          />
        </div>
      </div>
    </>
  );
};
