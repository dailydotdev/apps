import type { ReactElement } from 'react';
import React from 'react';
import type { NotificationType } from './utils';
import { descriptionIcon } from './utils';
import { IconSize } from '../Icon';

interface NotificationItemDescriptionIconProps {
  type: NotificationType;
}

export const NotificationItemDescriptionIcon = ({
  type,
}: NotificationItemDescriptionIconProps): ReactElement => {
  const Icon = descriptionIcon[type];
  if (!Icon) {
    return null;
  }

  return <Icon size={IconSize.XSmall} className="text-brand-default" />;
};
