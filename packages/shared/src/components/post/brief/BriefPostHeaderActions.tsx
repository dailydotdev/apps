import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import type { PostHeaderActionsProps } from '../common';
import Link from '../../utilities/Link';
import { Button, ButtonSize } from '../../buttons/Button';
import { settingsUrl } from '../../../lib/constants';
import { LinkIcon, SettingsIcon } from '../../icons';
import { useSharePost } from '../../../hooks/useSharePost';
import type { Origin } from '../../../lib/log';

const Container = classed('div', 'flex flex-row items-center');

export const BriefPostHeaderActions = ({
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  origin,
  ...props
}: PostHeaderActionsProps & {
  origin: Origin;
}): ReactElement => {
  const { copyLink } = useSharePost(origin);

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <div className="absolute right-4 top-4 hidden laptop:block">
        <Button
          icon={<LinkIcon />}
          size={ButtonSize.Medium}
          onClick={() => copyLink({ post })}
        />
        <Link passHref href={`${settingsUrl}/notifications`}>
          <Button icon={<SettingsIcon />} tag="a" size={ButtonSize.Medium} />
        </Link>
      </div>
    </Container>
  );
};
