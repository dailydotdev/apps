import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
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
      className={classNames(
        'group flex h-full flex-col overflow-hidden !bg-surface-float transition-all hover:!bg-surface-hover hover:shadow-2',
      )}
    >
      <HighlightCardContent
        highlights={highlights}
        onHighlightClick={onHighlightClick}
        onReadAllClick={onReadAllClick}
        variant="grid"
      />
    </Card>
  );
});
