import React, { ReactElement } from 'react';
import { SourceAvatarProps } from '../../profile/source';
import { CollectionPillSources } from '../../post/collection';
import OptionsButton from '../../buttons/OptionsButton';

interface CollectionCardHeaderProps {
  sources: SourceAvatarProps['source'][];
  totalSources: number;
  onMenuClick?: (e: React.MouseEvent) => void;
}

export const CollectionCardHeader = ({
  sources,
  totalSources,
  onMenuClick,
}: CollectionCardHeaderProps): ReactElement => {
  return (
    <>
      <CollectionPillSources
        className={{ main: 'm-2' }}
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
