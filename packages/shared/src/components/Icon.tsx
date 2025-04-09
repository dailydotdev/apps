import type { ComponentProps, ReactElement, ReactNode } from 'react';
import React, { Children } from 'react';
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
  Size48 = 'size48',
  XXXLarge = 'xxxlarge',
  Size80 = 'size80',
}

export const iconSizeToClassName: Record<IconSize, string> = {
  [IconSize.XXSmall]: 'w-3 h-3',
  [IconSize.Size16]: 'size-4',
  [IconSize.XSmall]: 'w-5 h-5',
  [IconSize.Small]: 'w-6 h-6',
  [IconSize.Medium]: 'w-7 h-7',
  [IconSize.Large]: 'w-8 h-8',
  [IconSize.XLarge]: 'w-10 h-10',
  [IconSize.Size48]: 'w-12 h-12',
  [IconSize.XXLarge]: 'w-14 h-14',
  [IconSize.XXXLarge]: 'w-16 h-16',
  [IconSize.Size80]: 'w-20 h-20',
};

export type IconItemType = React.ComponentType<{ className: string }>;

export interface IconProps extends ComponentProps<'svg'> {
  secondary?: boolean;
  size?: IconSize;
}

type Props = IconProps & {
  IconPrimary: IconItemType;
  IconSecondary: IconItemType;
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

export /**
 * Icon wrapper so we can use more then single element inside the icon
 * prop on different components. Wrapper automatically applies icon
 * props as size to all children.
 */
const IconWrapper = ({
  size,
  wrapperClassName,
  children,
  ...rest
}: Omit<IconProps, 'className'> & {
  wrapperClassName?: string;
  children: ReactNode;
}): ReactElement => {
  return (
    <div className={wrapperClassName}>
      {Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // so that className is no exposed from outside since components
          // like Button override it for icons
          const { className } = rest as { className: string };

          return React.cloneElement<Props>(child as ReactElement, {
            size,
            className: classNames(child.props.className, className),
          });
        }

        return child;
      })}
    </div>
  );
};

export default Icon;
