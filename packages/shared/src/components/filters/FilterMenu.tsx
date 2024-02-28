import React, { ReactElement, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import MultiLevelMenu from '../multiLevelMenu/MultiLevelMenu';
import { MenuItem } from './common';
import { HashtagIcon, FilterIcon, BlockIcon, PlusIcon } from '../icons';
import TagsFilter from './TagsFilter';
import BlockedFilter from './BlockedFilter';
import AdvancedSettingsFilter from './AdvancedSettings';
import { Source } from '../../graphql/sources';
import { PromptOptions, usePrompt } from '../../hooks/usePrompt';
import { UnblockSourceCopy, UnblockTagCopy } from './UnblockCopy';
import { ContentTypesFilter } from './ContentTypesFilter';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';

const NewSourceModal = dynamic(
  () =>
    import(/* webpackChunkName: "newSourceModal" */ '../modals/NewSourceModal'),
);

export interface UnblockItem {
  tag?: string;
  source?: Source;
  action?: () => unknown;
}

interface FilterMenuProps {
  directlyOpenedTab?: string;
}

export const unBlockPromptOptions: PromptOptions = {
  title: 'Are you sure?',
  okButton: {
    title: 'Yes, unblock',
  },
};

export default function FilterMenu({
  directlyOpenedTab,
}: FilterMenuProps): ReactElement {
  const { isLoggedIn, showLogin } = useAuthContext();
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const { showPrompt } = usePrompt();
  const unBlockPrompt = async ({ action, source, tag }: UnblockItem) => {
    const description = tag ? (
      <UnblockTagCopy name={tag} />
    ) : (
      <UnblockSourceCopy name={source.name} />
    );
    if (await showPrompt({ ...unBlockPromptOptions, description })) {
      action?.();
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: <HashtagIcon className="mr-3 text-xl" />,
      title: 'Manage tags',
      component: <TagsFilter onUnblockItem={unBlockPrompt} />,
    },
    {
      icon: <FilterIcon className="mr-3 text-xl" />,
      title: 'Advanced',
      component: <AdvancedSettingsFilter />,
    },
    {
      icon: <BlockIcon className="mr-3 text-xl" />,
      title: 'Content Types',
      component: <ContentTypesFilter />,
    },
    {
      icon: <BlockIcon className="mr-3 text-xl" />,
      title: 'Blocked items',
      component: <BlockedFilter onUnblockItem={unBlockPrompt} />,
    },
    {
      icon: <PlusIcon className="mr-3 text-xl" />,
      title: 'Suggest new source',
      action: () => {
        if (isLoggedIn) {
          setShowNewSourceModal(true);
        } else {
          showLogin({ trigger: AuthTriggers.SubmitNewSource });
        }
      },
    },
  ];

  const initialTab = useMemo(
    () =>
      directlyOpenedTab &&
      menuItems.find((item) => item.title === directlyOpenedTab),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    </>
  );
}
