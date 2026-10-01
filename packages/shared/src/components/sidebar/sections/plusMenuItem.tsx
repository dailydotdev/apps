import React from 'react';
import classNames from 'classnames';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DevPlusIcon } from '../../icons/DevPlus';
import { plusUrl } from '../../../lib/constants';
import { PlusPreview, PlusPreviewNote } from '../../plus/PlusPreview';
import { PlusSaleLabel } from '../../plus/PlusSaleLabel';

interface CreatePlusMenuItemProps {
  onClick: () => void;
  isSaleActive: boolean;
}

export const createPlusMenuItem = ({
  onClick,
  isSaleActive,
}: CreatePlusMenuItemProps): SidebarMenuItem => ({
  icon: (active: boolean) => (
    <ListIcon
      Icon={({ className }) => (
        <DevPlusIcon
          secondary={active}
          className={classNames(className, 'text-action-plus-default')}
        />
      )}
    />
  ),
  title: 'Get Plus',
  path: plusUrl,
  isForcedLink: true,
  requiresLogin: true,
  action: onClick,
  renderPreview: (trigger) => (
    <PlusPreview footer={<PlusPreviewNote>Click to see plans</PlusPreviewNote>}>
      {trigger}
    </PlusPreview>
  ),
  ...(isSaleActive && { rightIcon: () => <PlusSaleLabel /> }),
});
