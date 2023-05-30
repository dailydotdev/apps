import classNames from 'classnames';
import React, { FunctionComponent, ReactElement, ReactNode } from 'react';
import { IconProps, IconSize } from './Icon';
import useMedia from '../hooks/useMedia';
import { tablet } from '../styles/media';

export type UserBadgeProps = {
  className?: string;
  content: ReactNode;
  Icon: FunctionComponent<IconProps>;
  iconProps?: IconProps;
};

const UserBadge = ({
  className,
  content,
  Icon,
  iconProps,
}: UserBadgeProps): ReactElement => {
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);

  return (
    <span
      className={classNames(
        'flex items-center tablet:ml-2 tablet:gap-0.5 tablet:typo-footnote ml-1 typo-caption2 font-bold capitalize',
        className,
      )}
    >
      {typeof Icon === 'function' && (
        <Icon size={isMobile ? IconSize.XXSmall : undefined} {...iconProps} />
      )}
      {content}
    </span>
  );
};

export default UserBadge;
