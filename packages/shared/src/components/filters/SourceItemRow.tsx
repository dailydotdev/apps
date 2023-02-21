import React, { ReactElement } from 'react';
import { FilterItem } from './common';
import { Source } from '../../graphql/sources';
import { LazyImage } from '../LazyImage';
import { Button } from '../buttons/Button';
import BlockIcon from '../icons/Block';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

export default function SourceItemRow({
  source,
  onSourceClick,
  blocked,
}: {
  source: Source;
  onSourceClick?: (source: Source) => unknown;
  blocked?: boolean;
}): ReactElement {
  return (
    <FilterItem className="relative">
      <a className="flex h-12 flex-1 cursor-default items-center rounded-md py-2 pr-14 pl-6">
        <LazyImage
          imgSrc={source.image}
          imgAlt={`${source.name} logo`}
          className="h-8 w-8 rounded-md"
        />
        <span className="ml-3 flex-1 truncate text-left text-theme-label-tertiary typo-callout">
          {source.name}
        </span>
      </a>
      <SimpleTooltip
        placement="left"
        content={blocked ? 'Unblock source' : 'Block source'}
      >
        <Button
          className="btn-tertiary right-4 my-auto"
          style={{ position: 'absolute' }}
          onClick={() => onSourceClick?.(source)}
          icon={<BlockIcon />}
        />
      </SimpleTooltip>
    </FilterItem>
  );
}
