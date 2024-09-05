import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { IconProps } from '../../Icon';
import { UpvoteIcon } from '../Upvote';

export const DownvoteIcon = ({
  className,
  ...rest
}: IconProps): ReactElement => (
  <UpvoteIcon {...rest} className={classNames(className, 'rotate-180')} />
);
