import React, { ReactElement } from 'react';
import classnames from 'classnames';
import classNames from 'classnames';
import { SourceAvatarProps } from '../../profile/source';
import { CollectionPillSources } from '../../post/collection';
import OptionsButton from '../../buttons/OptionsButton';
import { BookmarkIcon } from '../../icons';
import { useBookmarkProvider } from '../../../hooks/useBookmarkProvider';

interface CollectionCardHeaderProps {
  sources: SourceAvatarProps['source'][];
  totalSources: number;
  onMenuClick?: (e: React.MouseEvent) => void;
  bookmarked?: boolean;
}

export const CollectionCardHeader = ({
  sources,
  totalSources,
  onMenuClick,
  bookmarked,
}: CollectionCardHeaderProps): ReactElement => {
  const highlightBookmarkedPost = useBookmarkProvider(bookmarked);

  return (
    <>
      {highlightBookmarkedPost && (
        <div
          className={classNames(
            'laptop:mouse:flex laptop:mouse:group-hover:hidden',
            'relative my-1 flex h-10 py-2 text-action-bookmark-default typo-footnote',
          )}
        >
          <BookmarkIcon secondary className="mx-1" />
          Revisit this post you saved earlier?
        </div>
      )}
      <CollectionPillSources
        className={{
          main: classnames(
            'm-2',
            highlightBookmarkedPost &&
              'laptop:mouse:hidden laptop:mouse:group-hover:flex',
          ),
        }}
        sources={sources}
        totalSources={totalSources}
      />
      <OptionsButton
        className="absolute right-3 top-3 group-hover:flex laptop:hidden"
        onClick={onMenuClick}
        tooltipPlacement="top"
      />
    </>
  );
};
