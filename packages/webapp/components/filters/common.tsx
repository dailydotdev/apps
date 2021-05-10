import React, { CSSProperties, ReactElement } from 'react';
import classed from '../../lib/classed';
import sizeN from '../../macros/sizeN.macro';
import { ElementPlaceholder } from '../utilities';
import { Button } from '@dailydotdev/shared';
import ArrowIcon from '@dailydotdev/shared/icons/arrow.svg';
import { getTooltipProps } from '../../lib/tooltip';
import Link from 'next/link';
import classNames from 'classnames';

export const FiltersContainer = classed(
  'div',
  'flex flex-col w-full pr-4 pb-4 pl-6',
);

const Placeholder = (
  <div className="flex justify-between">
    <ElementPlaceholder className="rounded-md" style={{ width: sizeN(30) }} />
    <ElementPlaceholder className="w-5 rounded-md" />
  </div>
);

export const FiltersPlaceholder = (): ReactElement => (
  <div
    className="grid grid-flow-row gap-y-7 mt-9"
    style={{ gridAutoRows: sizeN(5) }}
  >
    {Array(5).fill(Placeholder)}
  </div>
);

export const FiltersSection = classed('section', 'flex flex-col items-stretch');

export const FiltersHeadline = classed('h3', 'my-6 font-bold typo-callout');

export const FiltersList = classed('ul', 'flex flex-col p-0');

export const FilterItem = classed('li', 'flex items-center p-0');

export const FilterLine = classed(
  'div',
  'h-px flex-1 mx-3 bg-theme-divider-tertiary',
);

export const GoToFilterButton = ({
  href,
  tooltip,
  className,
  style,
}: {
  href: string;
  tooltip: string;
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <Link href={href} passHref prefetch={false}>
    <Button
      tag="a"
      icon={
        <ArrowIcon
          style={{
            transform: 'rotate(90deg)',
          }}
        />
      }
      className={classNames(className, 'btn-tertiary')}
      style={style}
      {...getTooltipProps(tooltip, { position: 'left' })}
    />
  </Link>
);

export type FilterProps = {
  enableQueries?: boolean;
  query?: string;
};
