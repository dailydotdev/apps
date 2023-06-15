import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Source } from '../../../graphql/sources';
import { FlexRow } from '../../utilities';
import { SourceAvatar } from './SourceAvatar';

interface SourceShortInfoProps {
  source: Source;
  className?: string;
}

export function SourceShortInfo({
  source,
  className,
}: SourceShortInfoProps): ReactElement {
  if (!source) return null;

  return (
    <FlexRow className={classNames('py-3', className)}>
      <SourceAvatar source={source} />
      <span className="flex flex-col typo-callout">
        <h3 className="font-bold">{source.name}</h3>
        <p className="text-theme-label-quaternary">@{source.handle}</p>
      </span>
    </FlexRow>
  );
}
