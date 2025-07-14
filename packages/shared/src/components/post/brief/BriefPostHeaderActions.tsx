import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import type { PostHeaderActionsProps } from '../common';
import Link from '../../utilities/Link';
import { Button, ButtonSize } from '../../buttons/Button';
import { settingsUrl } from '../../../lib/constants';
import { SettingsIcon } from '../../icons';

const Container = classed('div', 'flex flex-row items-center');

export const BriefPostHeaderActions = ({
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  ...props
}: PostHeaderActionsProps): ReactElement => {
  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <Link passHref href={`${settingsUrl}/notifications`}>
        <Button
          className="absolute right-4 top-4 hidden laptop:block"
          icon={<SettingsIcon />}
          tag="a"
          size={ButtonSize.Medium}
        />
      </Link>
    </Container>
  );
};
