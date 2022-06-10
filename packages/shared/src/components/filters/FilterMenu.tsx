import React, { ReactElement, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import MultiLevelMenu from '../multiLevelMenu/MultiLevelMenu';
import { MenuItem } from './common';
import HashtagIcon from '../icons/Hashtag';
import FilterIcon from '../icons/Filter';
import BlockIcon from '../icons/Block';
import PlusIcon from '../icons/Plus';
import TagsFilter from './TagsFilter';
import BlockedFilter from './BlockedFilter';
import AdvancedSettingsFilter from './AdvancedSettings';
import UnblockModal from '../modals/UnblockModal';
import { Source } from '../../graphql/sources';

const NewSourceModal = dynamic(() => import('../modals/NewSourceModal'));

interface UnblockItem {
  tag?: string;
  source?: Source;
  action?: () => unknown;
}

interface FilterMenuProps {
  directlyOpenedTab?: string;
}

export default function FilterMenu({
  directlyOpenedTab,
}: FilterMenuProps): ReactElement {
  const [unblockItem, setUnblockItem] = useState<UnblockItem>();
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);

  const menuItems: MenuItem[] = [
    {
      icon: <HashtagIcon className="mr-3 text-xl" />,
      title: 'Manage tags',
      component: <TagsFilter onUnblockItem={setUnblockItem} />,
    },
    {
      icon: <FilterIcon className="mr-3 text-xl" />,
      title: 'Advanced',
      component: <AdvancedSettingsFilter />,
    },
    {
      icon: <BlockIcon className="mr-3 text-xl" />,
      title: 'Blocked items',
      component: <BlockedFilter onUnblockItem={setUnblockItem} />,
    },
    {
      icon: <PlusIcon className="mr-3 text-xl" />,
      title: 'Suggest new source',
      action: () => setShowNewSourceModal(true),
    },
  ];

  const initialTab = useMemo(
    () =>
      directlyOpenedTab &&
      menuItems.find((item) => item.title === directlyOpenedTab),
    [directlyOpenedTab],
  );

  return (
    <>
      <MultiLevelMenu menuItems={menuItems} directlyOpenedTab={initialTab} />
      {showNewSourceModal && (
        <NewSourceModal
          isOpen={showNewSourceModal}
          onRequestClose={() => setShowNewSourceModal(false)}
        />
      )}
      {unblockItem && (
        <UnblockModal
          item={unblockItem}
          isOpen={!!unblockItem}
          onConfirm={unblockItem.action}
          onRequestClose={() => setUnblockItem(null)}
        />
      )}
    </>
  );
}
