import React, { HTMLAttributes, ReactElement } from 'react';
import { FilterItem } from './common';
import { Source } from '../../graphql/sources';
import { getTooltipProps } from '../../lib/tooltip';
import { LazyImage } from '../LazyImage';
import { Button } from '../buttons/Button';
import BlockIcon from '../../../icons/block.svg';

export default function SourceItemRow({
  source,
  onClick,
  blocked,
}: {
  source: Source;
  onClick?: (source: Source) => unknown;
  blocked?: boolean;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement {
  return (
    <FilterItem className="relative">
      <a
        {...getTooltipProps(`${source.name} feed`)}
        className="flex flex-1 items-center py-1 pr-14 pl-6 h-12 hover:bg-theme-hover active:bg-theme-active rounded-md focus-outline"
      >
        <LazyImage
          imgSrc={source.image}
          imgAlt={`${source.name} logo`}
          className="w-8 h-8 rounded-md"
        />
        <span className="flex-1 ml-3 text-left truncate typo-callout text-theme-label-tertiary">
          {source.name}
        </span>
      </a>
      <Button
        className="right-4 my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        onClick={() => onClick?.(source)}
        icon={<BlockIcon />}
        {...getTooltipProps(blocked ? 'Unblock source' : 'Block source', {
          position: 'left',
        })}
      />
    </FilterItem>
  );
}
