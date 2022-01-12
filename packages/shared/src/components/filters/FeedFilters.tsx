import React, { ReactElement, useContext, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import classNames from 'classnames';
import sizeN from '../../../macros/sizeN.macro';
import FilterMenu from './FilterMenu';
import XIcon from '../../../icons/x.svg';
import PlusIcon from '../../../icons/plus.svg';
import { menuItemClassNames } from '../multiLevelMenu/MultiLevelMenuMaster';
import useFeedSettings, {
  getFeedSettingsQueryKey,
  updateLocalFeedSettings,
} from '../../hooks/useFeedSettings';
import AuthContext from '../../contexts/AuthContext';
import { Button } from '../buttons/Button';
import { AllTagCategoriesData } from '../../graphql/feedSettings';
import AlertContext from '../../contexts/AlertContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { useMyFeed } from '../../hooks/useMyFeed';

const asideWidth = sizeN(89);
interface FeedFiltersProps {
  isOpen?: boolean;
  onBack?: () => void;
}

export default function FeedFilters({
  isOpen,
  onBack,
}: FeedFiltersProps): ReactElement {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { user, showLogin } = useContext(AuthContext);
  const { hasAnyFilter } = useFeedSettings();
  const { shouldShowMyFeed } = useMyFeed();

  const onCreate = () => {
    trackEvent({
      event_name: 'click',
      target_type: 'create feed filters',
      target_id: 'feed-filters',
    });
    const key = getFeedSettingsQueryKey(user);
    const { feedSettings } = client.getQueryData(key) as AllTagCategoriesData;
    updateLocalFeedSettings(feedSettings);
    showLogin('create feed filters');
  };

  useEffect(() => {
    if (isOpen && alerts?.filter && hasAnyFilter && user && !shouldShowMyFeed) {
      updateAlerts({ filter: false });
    }
  }, [isOpen, alerts, user, hasAnyFilter]);

  const directlyOpenedTab =
    isOpen && shouldShowMyFeed && alerts?.filter && 'Manage tags';

  return (
    <aside
      className={classNames(
        'fixed top-14 left-0 z-3 bottom-0 self-stretch bg-theme-bg-primary rounded-r-2xl border-t border-r border-theme-divider-primary overflow-y-auto',
        'transition-transform duration-200 ease-linear delay-100',
        isOpen ? 'translate-x-0' : '-translate-x-96 pointer-events-none',
      )}
      style={{ width: asideWidth }}
    >
      <div
        className={classNames(
          menuItemClassNames,
          'border-b border-theme-divider-tertiary flex-row justify-between',
        )}
      >
        <button onClick={onBack} type="button">
          <XIcon className="text-2xl -rotate-90 text-theme-label-tertiary" />
        </button>
        {shouldShowMyFeed && !user && (
          <Button
            className="btn-primary-avocado"
            buttonSize="small"
            icon={<PlusIcon className="mr-1" />}
            onClick={onCreate}
          >
            Create
          </Button>
        )}
      </div>
      <FilterMenu directlyOpenedTab={directlyOpenedTab} />
    </aside>
  );
}
