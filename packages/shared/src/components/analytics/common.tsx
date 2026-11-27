import type { ReactElement } from 'react';
import type { IconProps } from '../Icon';

export type AnalyticsNumberList = {
  icon: ReactElement<IconProps>;
  label: string;
  value: number | string;
  tooltip?: string;
}[];
