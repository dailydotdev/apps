import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import type { PostHeaderActionsProps } from '../common';
import Link from '../../utilities/Link';
import { Button, ButtonSize } from '../../buttons/Button';
import { settingsUrl } from '../../../lib/constants';
import { SettingsIcon } from '../../icons';
import { useShareBriefingDigest } from '../../../hooks/useShareBriefingDigest';
import {
  BriefCopyLinkButton,
  BriefShareControls,
} from '../../brief/BriefShareControls';
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
  const isShareEnabled = useShareBriefingDigest();

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      {/* Rendered outside the laptop-only wrapper: sharing a briefing is at
          least as valuable on mobile, where the share arrow taps straight
          through to the native sheet. */}
      {showShareButton && isShareEnabled && (
        <BriefShareControls
          post={post}
          origin={origin}
          size={ButtonSize.Medium}
          className="flex flex-row items-center gap-2"
        />
      )}
      <div className="hidden laptop:block">
        {showShareButton && !isShareEnabled && (
          <BriefCopyLinkButton
            post={post}
            origin={origin}
            size={ButtonSize.Medium}
          />
        )}
        <Link passHref href={`${settingsUrl}/notifications`}>
          <Button icon={<SettingsIcon />} tag="a" size={ButtonSize.Medium} />
        </Link>
      </div>
    </Container>
  );
};
