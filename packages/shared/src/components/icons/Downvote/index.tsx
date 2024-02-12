import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { UpvoteIcon } from '../Upvote';
import { IconProps } from '../../Icon';

export const DownvoteIcon = ({
  className,
  ...rest
}: IconProps): ReactElement => (
  <UpvoteIcon {...rest} className={classNames(className, 'rotate-180')} />
);
