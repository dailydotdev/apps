import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';

export enum IconSize {
  XXSmall = 'xxsmall',
  Size16 = 'size16',
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
  XXLarge = 'xxlarge',
  XXXLarge = 'xxxlarge',
}

export const iconSizeToClassName: Record<IconSize, string> = {
  [IconSize.XXSmall]: 'w-3 h-3',
  [IconSize.Size16]: 'size-4',
  [IconSize.XSmall]: 'w-5 h-5',
  [IconSize.Small]: 'w-6 h-6',
  [IconSize.Medium]: 'w-7 h-7',
  [IconSize.Large]: 'w-8 h-8',
  [IconSize.XLarge]: 'w-10 h-10',
  [IconSize.XXLarge]: 'w-14 h-14',
  [IconSize.XXXLarge]: 'w-16 h-16',
};

type ItemType = React.ComponentType<{ className }>;

export interface IconProps {
  secondary?: boolean;
  size?: IconSize;
  className?: string;
  style?: CSSProperties;
}

type Props = IconProps & {
  IconPrimary: ItemType;
  IconSecondary: ItemType;
};

const Icon = ({
  secondary = false,
  size = IconSize.XSmall,
  className = '',
  IconPrimary,
  IconSecondary,
  ...rest
}: Props): ReactElement => {
  const IconComponent = secondary ? IconSecondary : IconPrimary;

  return (
    <IconComponent
      className={classNames(
        iconSizeToClassName[size],
        'pointer-events-none',
        className,
      )}
      {...rest}
    />
  );
};

export default Icon;
