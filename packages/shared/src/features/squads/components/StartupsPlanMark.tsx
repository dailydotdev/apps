import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SparkleIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { startupsLavender } from '../../../styles/custom';

/** The mark of a daily.dev for Startups plan, wherever the plan is named */
export const StartupsPlanMark = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames('flex shrink-0', className)}
    style={{ color: startupsLavender }}
  >
    <SparkleIcon size={IconSize.Size16} secondary />
  </span>
);
