import { HTMLAttributes } from 'react';
import { Ad } from '../../../../graphql/posts';

type Callback = (ad: Ad) => unknown;
export interface AdCardProps {
  ad: Ad;
  onLinkClick?: Callback;
  domProps?: HTMLAttributes<HTMLDivElement>;
}
