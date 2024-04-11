import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import {
  EyeIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ContextMenu as ContextMenuIds } from '@dailydotdev/shared/src/hooks/constants';
import { MenuIcon } from '@dailydotdev/shared/src/components/MenuIcon';

const ContextMenu = dynamic(
  () =>
    import(
      /* webpackChunkName: "contextMenu" */ '@dailydotdev/shared/src/components/fields/ContextMenu'
    ),
  {
    ssr: false,
  },
);

export default function ShortcutOptionsMenu({
  isOpen,
  onHide,
  onManage,
}: {
  isOpen: boolean;
  onHide: () => void;
  onManage: () => void;
}): ReactElement {
  const options = [
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      label: 'Hide',
      action: onHide,
    },
    {
      icon: <MenuIcon Icon={SettingsIcon} />,
      label: 'Manage',
      action: onManage,
    },
  ];

  return (
    <ContextMenu
      options={options}
      isOpen={isOpen}
      id={ContextMenuIds.ShortcutContext}
    />
  );
}
