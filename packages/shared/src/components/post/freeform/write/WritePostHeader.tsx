import type { ReactElement } from 'react';
import React from 'react';
import SourceButton from '../../../cards/common/SourceButton';
import { useWritePostContext } from '../../../../contexts';
import { SourceType } from '../../../../graphql/sources';

interface WritePostHeaderProps {
  isEdit?: boolean;
}

export function WritePostHeader({
  isEdit,
}: WritePostHeaderProps): ReactElement {
  const { squad } = useWritePostContext();

  return (
    <header className="border-border-subtlest-tertiary flex h-14 flex-row items-center border-b px-6 py-4">
      <h1 className="typo-title3 font-bold">{isEdit ? 'Edit' : 'New'} post</h1>

      {squad && squad.type === SourceType.Squad && (
        <>
          <div className="ml-auto flex flex-col text-right">
            <span className="text typo-subhead font-bold">{squad.name}</span>
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
