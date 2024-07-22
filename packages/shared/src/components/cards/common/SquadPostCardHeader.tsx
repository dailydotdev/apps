import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Post } from '../../../graphql/posts';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import SourceButton from '../SourceButton';
import PostMetadata from '../PostMetadata';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from '../BookmarkProviderHeader';
import { useConditionalFeature } from '../../../hooks';
import { feature } from '../../../lib/featureManagement';
import { ProfileTooltip } from '../../profile/ProfileTooltip';
import { ProfileImageLink } from '../../profile/ProfileImageLink';

type SquadPostCardHeaderProps = Pick<
  Post,
  'author' | 'source' | 'permalink' | 'createdAt' | 'bookmarked'
> & { enableSourceHeader?: boolean };

export const SquadPostCardHeader = ({
  author,
  createdAt,
  source,
  enableSourceHeader = false,
  bookmarked,
}: SquadPostCardHeaderProps): ReactElement => {
  const { value: shouldShowNewImage } = useConditionalFeature({
    shouldEvaluate: !!author,
    feature: feature.authorImage,
  });
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked,
  });

  const getDescription = () => {
    if (!author) {
      return undefined;
    }

    return enableSourceHeader ? author.name : `@${author.username}`;
  };

  const getHeaderName = () => {
    if (enableSourceHeader) {
      return source.name;
    }

    return author?.name || '';
  };

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
          {!shouldShowNewImage && author && (
            <ProfilePicture
              user={author}
              size={
                enableSourceHeader
                  ? ProfileImageSize.XSmall
                  : ProfileImageSize.XLarge
              }
              className={enableSourceHeader && '-right-2.5 top-7'}
              absolute={enableSourceHeader}
            />
          )}
          <SourceButton
            source={source}
            className={!enableSourceHeader && 'absolute -bottom-2 -right-2'}
            size={
              enableSourceHeader
                ? ProfileImageSize.Large
                : ProfileImageSize.XSmall
            }
          />
          {shouldShowNewImage && author && (
            <ProfileTooltip user={author}>
              <ProfileImageLink
                picture={{ size: ProfileImageSize.Large }}
                user={author}
              />
            </ProfileTooltip>
          )}
        </div>
        <div className="ml-2 mr-6 flex flex-1 flex-col overflow-auto typo-footnote">
          <span
            className="line-clamp-2 break-words font-bold"
            title={getHeaderName()}
          >
            {getHeaderName()}
          </span>
          <PostMetadata
            className="line-clamp-1 break-words"
            createdAt={createdAt}
            description={getDescription()}
          />
        </div>
      </div>
    </>
  );
};
