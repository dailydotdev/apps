import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../../graphql/posts';
import { ProfileImageSize } from '../../ProfilePicture';
import SourceButton from '../SourceButton';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from '../BookmarkProviderHeader';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileImageLink } from '../../profile/ProfileImageLink';

type SquadPostCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'permalink' | 'bookmarked'
> & { enableSourceHeader?: boolean };

export const SquadPostCardHeader = ({
  author,
  source,
  enableSourceHeader = false,
  bookmarked,
}: SquadPostCardHeaderProps): ReactElement => {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked,
  });

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
          'relative m-2 flex gap-2',
          highlightBookmarkedPost && headerHiddenClassName,
        )}
      >
        <div className="relative flex flex-row gap-2">
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
          {author && (
            <ProfileTooltip userId={author.id}>
              <ProfileImageLink
                picture={{ size: ProfileImageSize.Medium }}
                user={author}
              />
            </ProfileTooltip>
          )}
        </div>
      </div>
    </>
  );
};
