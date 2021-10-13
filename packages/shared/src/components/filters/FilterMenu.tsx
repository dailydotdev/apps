import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import Drawer from '../drawer/Drawer';
import { MenuItem } from './common';

const NewSourceModal = dynamic(() => import('../modals/NewSourceModal'));

export default function FilterMenu(): ReactElement {
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const menuItems: MenuItem[] = [
    {
      icon: 'icon',
      title: 'Manage tags',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: 'icon',
      title: 'Advanced',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: 'icon',
      title: 'Blocked',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: 'icon',
      title: 'Suggest new source',
      action: () => setShowNewSourceModal(true),
    },
  ];

  return (
    <>
      <Drawer menuItems={menuItems} />
      {showNewSourceModal && (
        <NewSourceModal
          isOpen={showNewSourceModal}
          onRequestClose={() => setShowNewSourceModal(false)}
        />
      )}
    </>
  );
}
