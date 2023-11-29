import React, { ReactElement } from 'react';
import { SourceAvatarProps } from '../../profile/source';
import { CollectionPillSources } from '../../post/collection';
import OptionsButton from '../../buttons/OptionsButton';

interface CollectionCardHeaderProps {
  sources: SourceAvatarProps['source'][];
  totalSources: number;
  isHovered: boolean;
  onMenuClick?: (e: React.MouseEvent) => void;
}

export const CollectionCardHeader = ({
  sources,
  totalSources,
  isHovered,
  onMenuClick,
}: CollectionCardHeaderProps): ReactElement => {
  return (
    <>
      <CollectionPillSources
        className="m-2 mb-3"
        sources={sources}
        totalSources={totalSources}
        shouldShowSources={isHovered && sources.length > 0}
      />
      <OptionsButton
        className="group-hover:flex laptop:hidden top-3 right-3"
        onClick={onMenuClick}
        tooltipPlacement="top"
        position="absolute"
      />
    </>
  );
};
