import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
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
      className="group overflow-hidden !border-0 !border-t !border-border-subtlest-tertiary !bg-gradient-to-b !from-surface-float !to-background-default !px-4 !py-6"
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
