import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';

export enum IconSize {
  XXSmall = 'xxsmall',
  XSmall = 'xsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XLarge = 'xlarge',
  XXLarge = 'xxlarge',
  XXXLarge = 'xxxlarge',
}

const iconSizeToClassName: Record<IconSize, string> = {
  [IconSize.XXSmall]: 'w-3 h-3',
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
  tertiary?: boolean;
  size?: IconSize;
  className?: string;
  style?: CSSProperties;
}

type Props = IconProps & {
  IconPrimary: ItemType;
  IconSecondary: ItemType;
  IconTertiary?: ItemType;
};

const Icon = ({
  secondary = false,
  tertiary = false,
  size = IconSize.XSmall,
  className = '',
  IconPrimary,
  IconSecondary,
  IconTertiary,
  ...rest
}: Props): ReactElement => {
  let IconComponent = IconPrimary;

  if (secondary) {
    IconComponent = IconSecondary;
  } else if (tertiary) {
    IconComponent = IconTertiary;
  }

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
