import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

export interface MenuItemProps<
  TReturn = unknown,
  TArgs extends Array<unknown> = Array<unknown>,
  TAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>,
> {
  icon?: ReactNode;
  label: string;
  action?: (...args: TArgs) => TReturn;
  anchorProps?: TAnchorProps;
  Wrapper?: ComponentType<{ children: ReactNode }>;
  disabled?: boolean;
  ariaLabel?: string;
}
