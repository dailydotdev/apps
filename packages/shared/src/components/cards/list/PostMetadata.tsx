import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { TimeFormatType } from '../../../lib/dateFormat';
import { DateFormat } from '../../utilities';
import { Separator } from '../common';

export interface PostMetadataProps {
  className?: string;
  topLabel?: ReactElement | string;
  bottomLabel?: ReactElement | string;
  createdAt?: string;
}

export default function PostMetadata({
  className,
  createdAt,
  topLabel,
  bottomLabel,
}: PostMetadataProps): ReactElement {
  return (
    <div className={classNames('grid items-center', className)}>
      {topLabel && (
        <div className="truncate font-bold typo-footnote">{topLabel}</div>
      )}
      <div className="items-center truncate text-text-tertiary typo-footnote">
        {bottomLabel}
        {!!bottomLabel && !!createdAt && <Separator />}
        {!!createdAt && (
          <DateFormat date={createdAt} type={TimeFormatType.Post} />
        )}
      </div>
    </div>
  );
}
