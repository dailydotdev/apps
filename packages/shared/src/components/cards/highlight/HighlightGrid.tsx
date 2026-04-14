import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { Card } from '../common/Card';
import type { HighlightCardProps } from './common';
import {
  getHighlightCardContainerHandlers,
  HighlightCardContent,
} from './common';

export const HighlightGrid = forwardRef(function HighlightGrid(
  { highlights, onHighlightClick, onReadAllClick }: HighlightCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <Card
      ref={ref}
      data-testid="highlightItem"
      role={onReadAllClick ? 'button' : undefined}
      tabIndex={onReadAllClick ? 0 : undefined}
      aria-label={onReadAllClick ? 'Open highlights card' : undefined}
      {...getHighlightCardContainerHandlers(onReadAllClick)}
      className={classNames(
        'group flex h-full flex-col overflow-hidden !bg-surface-float hover:!bg-surface-float',
        onReadAllClick && 'cursor-pointer',
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
