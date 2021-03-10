import React, { ReactElement } from 'react';
import { getTooltipProps } from '../../lib/tooltip';
import styles from '../../styles/cards.module.css';

export default function TrendingFlag({
  trending,
}: {
  trending: number;
}): ReactElement {
  const description = `${trending} devs read it last hour`;
  return (
    <div className="absolute flex items-start left-0 bottom-full ml-5 h-5">
      <div
        className={`flex flex-col items-center w-10 h-full bg-theme-status-error rounded-t transform mouse:translate-y-4 ${styles.flag}`}
        {...getTooltipProps(description)}
      >
        <span className="typo-caption2 uppercase font-bold">Hot</span>
      </div>
      <span className="ml-2 typo-footnote text-theme-label-tertiary mouse:hidden">
        {description}
      </span>
    </div>
  );
}
