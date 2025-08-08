import type { ReactElement } from 'react';

export type AnalyticsNumberList = {
  icon: ReactElement;
  label: string;
  value: number | string;
  tooltip?: string;
}[];
