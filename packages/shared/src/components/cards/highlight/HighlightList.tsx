import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { ListCard } from '../common/list/ListCard';
import type { HighlightCardProps } from './common';
import { HighlightCardContent } from './common';

export const HighlightList = forwardRef(function HighlightList(
  { highlights, onHighlightClick, onReadAllClick }: HighlightCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard
      ref={ref}
      data-testid="highlightItem"
      className={classNames(
        'group overflow-hidden !border !border-border-subtlest-tertiary !bg-gradient-to-b !from-surface-float !to-background-default !py-4 shadow-2 hover:!bg-surface-float',
      )}
    >
      <HighlightCardContent
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
        variant="list"
      />
    </ListCard>
  );
});
