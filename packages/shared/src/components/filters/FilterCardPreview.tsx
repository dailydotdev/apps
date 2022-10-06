import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';

interface FilterCardPreviewProps {
  isListMode?: boolean;
}

const CardPreviewPlaceholder = classed(
  'div',
  'rounded-8 bg-theme-divider-secondary w-full',
);

function FilterCardPreview({
  isListMode,
}: FilterCardPreviewProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col p-2 rounded-8 bg-theme-divider-tertiary',
        isListMode ? 'h-11 w-full' : 'h-28 w-24',
      )}
    >
      {!isListMode && (
        <>
          <CardPreviewPlaceholder className="h-2.5" />
          <CardPreviewPlaceholder className="mt-1 w-3/4 h-2.5" />
        </>
      )}
      <CardPreviewPlaceholder
        className={isListMode ? 'h-3 my-auto' : 'h-12 mt-auto'}
      />
    </div>
  );
}

export const getFilterCardPreviews = (
  amount = 6,
  isListMode: boolean,
): ReactNode =>
  Array(amount)
    .fill(0)
    .map((n) => <FilterCardPreview key={n} isListMode={isListMode} />);

export default FilterCardPreview;
