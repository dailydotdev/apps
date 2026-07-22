import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import type { PostHeaderActionsProps } from '../common';
import Link from '../../utilities/Link';
import { Button, ButtonSize } from '../../buttons/Button';
import { settingsUrl } from '../../../lib/constants';
import { CopyIcon, LinkIcon, SettingsIcon } from '../../icons';
import { useSharePost } from '../../../hooks/useSharePost';
import { useShareCopyIcon } from '../../../hooks/useShareCopyIcon';
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
  showShareButton = false,
  ...props
}: PostHeaderActionsProps & {
  origin: Origin;
  showShareButton?: boolean;
}): ReactElement => {
  const { copyLink } = useSharePost(origin);
  const showCopyIcon = useShareCopyIcon();

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <div className="hidden laptop:block">
        {showShareButton && (
          <Button
            icon={showCopyIcon ? <CopyIcon /> : <LinkIcon />}
            size={ButtonSize.Medium}
            onClick={() => copyLink({ post })}
            aria-label="Copy link"
          />
        )}
        <Link passHref href={`${settingsUrl}/notifications`}>
          <Button icon={<SettingsIcon />} tag="a" size={ButtonSize.Medium} />
        </Link>
      </div>
    </Container>
  );
};
