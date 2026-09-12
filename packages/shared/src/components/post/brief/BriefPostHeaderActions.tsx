import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import type { PostHeaderActionsProps } from '../common';
import Link from '../../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { settingsUrl } from '../../../lib/constants';
import { LinkIcon, SettingsIcon } from '../../icons';
import { ShareIcon } from '../../icons/Share';
import { Tooltip } from '../../tooltip/Tooltip';
import { useSharePost } from '../../../hooks/useSharePost';
import { CopyStateIcon } from '../../share/CopyStateIcon';
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
  contextMenuId: _contextMenuId,
  ...props
}: PostHeaderActionsProps & {
  origin: Origin;
  showShareButton?: boolean;
}): ReactElement => {
  const { copyLink, isCopying, openSharePost } = useSharePost(origin);

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {/* Below laptop the page's own header already has a copy link and a menu
          with Settings, so only Share joins it there. */}
      <div className="flex items-center gap-1">
        {showShareButton && (
          <>
            <Tooltip content={isCopying ? 'Copied!' : 'Copy link'}>
              <Button
                aria-label="Copy link"
                className="hidden laptop:flex"
                icon={<CopyStateIcon copied={isCopying} icon={LinkIcon} />}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Tertiary}
                onClick={() => copyLink({ post })}
              />
            </Tooltip>
            <Tooltip content="Share">
              <Button
                aria-label="Share briefing"
                icon={<ShareIcon />}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Tertiary}
                onClick={() => openSharePost({ post })}
              />
            </Tooltip>
          </>
        )}
        <Link passHref href={`${settingsUrl}/notifications`}>
          <Button
            className="hidden laptop:flex"
            icon={<SettingsIcon />}
            size={ButtonSize.Medium}
            tag="a"
            variant={ButtonVariant.Tertiary}
          />
        </Link>
      </div>
    </Container>
  );
};
