import type { HTMLAttributes } from 'react';
import type { Ad } from '../../../../graphql/posts';

type Callback = (ad: Ad) => unknown;
export interface AdCardProps {
  ad: Ad;
  index: number;
  feedIndex: number;
  onLinkClick?: Callback;
  domProps?: HTMLAttributes<HTMLDivElement>;
}
