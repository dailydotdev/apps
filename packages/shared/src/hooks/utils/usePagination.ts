import type { MouseEventHandler } from 'react';

export interface UsePagination<T = unknown> {
  onNext: MouseEventHandler;
  onPrevious: MouseEventHandler;
  current: number;
  max: number;
  paginated: T[];
}
