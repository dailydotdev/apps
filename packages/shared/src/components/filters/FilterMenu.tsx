import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import MultiLevelMenu from '../multiLevelMenu/MultiLevelMenu';
import { MenuItem } from './common';
import HashtagIcon from '../../../icons/hashtag.svg';
import FilterIcon from '../../../icons/filter.svg';
import BlockIcon from '../../../icons/block.svg';
import PlusIcon from '../../../icons/plus.svg';

const NewSourceModal = dynamic(() => import('../modals/NewSourceModal'));

export default function FilterMenu(): ReactElement {
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: <HashtagIcon className="mr-3 text-xl" />,
      title: 'Manage tags',
      component: () => dynamic(() => import('./TagsFilter')),
    },
    {
      icon: <FilterIcon className="mr-3 text-xl" />,
      title: 'Advanced',
      component: () => dynamic(() => import('./Test')),
    },
    {
      icon: <BlockIcon className="mr-3 text-xl" />,
      title: 'Blocked',
      component: () => dynamic(() => import('./BlockedFilter')),
    },

    {
      icon: <PlusIcon className="mr-3 text-xl" />,
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
