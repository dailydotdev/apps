import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import FilterMenu from './FilterMenu';
import CloseIcon from '../icons/Close';
import PlusIcon from '../icons/Plus';
import { menuItemClassNames } from '../multiLevelMenu/MultiLevelMenuMaster';
import useFeedSettings from '../../hooks/useFeedSettings';
import AuthContext from '../../contexts/AuthContext';
import AlertContext from '../../contexts/AlertContext';
import { useMyFeed } from '../../hooks/useMyFeed';
import CreateFeedFilterButton from '../CreateFeedFilterButton';

interface FeedFiltersProps {
  directlyOpenedTab?: string;
  isOpen?: boolean;
  onBack?: () => void;
}

export default function FeedFilters({
  directlyOpenedTab,
  isOpen,
  onBack,
}: FeedFiltersProps): ReactElement {
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  const { hasAnyFilter } = useFeedSettings();
  const { shouldShowMyFeed } = useMyFeed();

  useEffect(() => {
    if (isOpen && alerts?.filter && hasAnyFilter && user && !shouldShowMyFeed) {
      updateAlerts({ filter: false });
    }
  }, [isOpen, alerts, user, hasAnyFilter]);

  const openedTab =
    (shouldShowMyFeed && alerts?.filter && 'Manage tags') || directlyOpenedTab;

  return (
    <aside
      className={classNames(
        'fixed top-0 laptop:top-14 left-0 z-3 bottom-0 self-stretch bg-theme-bg-primary rounded-r-2xl border-t border-r border-theme-divider-primary overflow-y-auto',
        'transition-transform duration-200 ease-linear delay-100 w-[22.25rem]',
        isOpen ? 'translate-x-0' : '-translate-x-96 pointer-events-none',
      )}
    >
      <div
        className={classNames(
          menuItemClassNames,
          'border-b border-theme-divider-tertiary flex-row justify-between',
        )}
      >
        <button onClick={onBack} type="button">
          <CloseIcon
            size="medium"
            className="text-2xl -rotate-90 text-theme-label-tertiary"
          />
        </button>
        {shouldShowMyFeed && !user && (
          <CreateFeedFilterButton
            className="btn-primary-avocado"
            icon={<PlusIcon />}
            buttonSize="small"
            feedFilterModalType="v1"
          />
        )}
      </div>
      <FilterMenu directlyOpenedTab={openedTab} />
    </aside>
  );
}
