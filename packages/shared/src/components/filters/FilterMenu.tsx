import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import MultiLevelMenu from '../multiLevelMenu/MultiLevelMenu';
import { MenuItem } from './common';
import UserIcon from '../../../icons/user.svg';

const NewSourceModal = dynamic(() => import('../modals/NewSourceModal'));

export default function FilterMenu(): ReactElement {
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const menuItems: MenuItem[] = [
    {
      icon: <UserIcon className="mr-2 text-xl" />,
      title: 'Manage tags',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: <UserIcon className="mr-2 text-xl" />,
      title: 'Advanced',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: <UserIcon className="mr-2 text-xl" />,
      title: 'Blocked',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: <UserIcon className="mr-2 text-xl" />,
      title: 'Suggest new source',
      action: () => setShowNewSourceModal(true),
    },
  ];

  return (
    <>
      <MultiLevelMenu menuItems={menuItems} />
      {showNewSourceModal && (
        <NewSourceModal
          isOpen={showNewSourceModal}
          onRequestClose={() => setShowNewSourceModal(false)}
        />
      )}
    </>
  );
}
