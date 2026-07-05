import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import { Card } from '../common/Card';
import type { HighlightCardProps } from './common';
import { HighlightCardContent } from './common';

export const HighlightGrid = forwardRef(function HighlightGrid(
  { highlights, onHighlightClick, onReadAllClick }: HighlightCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <Card
      ref={ref}
      data-testid="highlightItem"
      className="group min-h-card overflow-hidden !bg-surface-float hover:!bg-surface-float"
    >
      <div className="absolute inset-0 flex flex-col">
        <HighlightCardContent
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onReadAllClick={onReadAllClick}
          variant="grid"
        />
      </div>
    </Card>
  );
});
