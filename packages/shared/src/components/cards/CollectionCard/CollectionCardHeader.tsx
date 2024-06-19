import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SourceAvatarProps } from '../../profile/source';
import { CollectionPillSources } from '../../post/collection';
import OptionsButton from '../../buttons/OptionsButton';
import useBookmarkProvider from '../../../hooks/useBookmarkProvider';
import {
  BookmakProviderHeader,
  headerHiddenClassName,
} from '../BookmarkProviderHeader';

interface CollectionCardHeaderProps {
  sources: SourceAvatarProps['source'][];
  totalSources: number;
  onMenuClick?: (e: React.MouseEvent) => void;
  bookmarked?: boolean;
  postId?: string;
}

export const CollectionCardHeader = ({
  sources,
  totalSources,
  onMenuClick,
  bookmarked,
  postId,
}: CollectionCardHeaderProps): ReactElement => {
  const { highlightBookmarkedPost } = useBookmarkProvider({
    bookmarked,
    postId,
  });

  return (
    <>
      {highlightBookmarkedPost && (
        <BookmakProviderHeader
          className={classNames('relative my-1 flex h-10 py-2')}
        />
      )}
      <CollectionPillSources
        className={{
          main: classNames(
            'm-2',
            highlightBookmarkedPost && headerHiddenClassName,
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
