import type { MouseEvent } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SidebarMenuItem } from '../common';
import { ListIcon } from '../common';
import { DevPlusIcon } from '../../icons/DevPlus';
import { plusUrl } from '../../../lib/constants';
import { PlusPreview } from '../../plus/PlusPreview';
import { PlusSaleLabel } from '../../plus/PlusSaleLabel';

interface CreatePlusMenuItemProps {
  onClick: (event?: MouseEvent<HTMLElement>) => void;
  onPreviewOpen: () => void;
  onPreviewAction: (event: MouseEvent<HTMLElement>) => void;
  isSaleActive: boolean;
}

export const createPlusMenuItem = ({
  onClick,
  onPreviewOpen,
  onPreviewAction,
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
  action: onClick,
  renderPreview: (trigger) => (
    <PlusPreview onOpen={onPreviewOpen} onAction={onPreviewAction}>
      {trigger}
    </PlusPreview>
  ),
  ...(isSaleActive && { rightIcon: () => <PlusSaleLabel /> }),
});
