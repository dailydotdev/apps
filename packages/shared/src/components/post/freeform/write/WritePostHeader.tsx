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
    <header className="flex h-14 flex-row items-center border-b border-border-subtlest-tertiary px-6 py-4">
      <h1 className="font-bold typo-title3">{isEdit ? 'Edit' : 'New'} post</h1>
      {squad && (
        <>
          <div className="ml-auto flex flex-col text-right">
            <span className="text font-bold typo-subhead">{squad.name}</span>
            <span className="text-text-tertiary typo-caption1">
              @{squad.handle}
            </span>
          </div>
          <SourceButton className="ml-1.5" source={squad} />
        </>
      )}
    </header>
  );
}
