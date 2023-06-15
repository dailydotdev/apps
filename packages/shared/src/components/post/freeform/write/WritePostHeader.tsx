import React, { ReactElement } from 'react';
import SourceButton from '../../../cards/SourceButton';
import { useWritePostContext } from '../../../../contexts';

interface WritePostHeaderProps {
  isEdit?: boolean;
}

export function WritePostHeader({
  isEdit,
}: WritePostHeaderProps): ReactElement {
  const { squad } = useWritePostContext();

  return (
    <header className="flex flex-row items-center py-4 px-6 h-14 border-b border-theme-divider-tertiary">
      <h1 className="font-bold typo-title3">{isEdit ? 'Edit' : 'New'} post</h1>
      {squad && (
        <>
          <div className="flex flex-col ml-auto text-right">
            <span className="font-bold text typo-subhead">{squad.name}</span>
            <span className="typo-caption1 text-theme-label-tertiary">
              @{squad.handle}
            </span>
          </div>
          <SourceButton className="ml-1.5" source={squad} />
        </>
      )}
    </header>
  );
}
