import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { Post } from '../../../graphql/posts';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileImageSize } from '../../ProfilePicture';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from '../BookmarkProviderHeader';
import SourceButton from '../SourceButton';

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
            <ProfileTooltip user={author}>
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
