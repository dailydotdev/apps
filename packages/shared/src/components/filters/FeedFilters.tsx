import React, { ReactElement, useContext, useEffect, useState } from 'react';
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
import AlertContext from '../../contexts/AlertContext';
import { Source } from '../../graphql/sources';
import UnblockModal from '../modals/UnblockModal';
import AuthContext from '../../contexts/AuthContext';
import { Button } from '../buttons/Button';
import { AllTagCategoriesData } from '../../graphql/feedSettings';
import { Features, isFeaturedEnabled } from '../../lib/featureManagement';
import FeaturesContext from '../../contexts/FeaturesContext';

const asideWidth = sizeN(89);

interface FeedFiltersProps {
  isOpen?: boolean;
  onBack?: () => void;
}

interface UnblockItem {
  tag?: string;
  source?: Source;
  action?: () => unknown;
}

export default function FeedFilters({
  isOpen,
  onBack,
}: FeedFiltersProps): ReactElement {
  const client = useQueryClient();
  const [unblockItem, setUnblockItem] = useState<UnblockItem>();
  const { user } = useContext(AuthContext);
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { hasAnyFilter } = useFeedSettings();
  const { flags } = useContext(FeaturesContext);
  const shouldShowMyFeed = isFeaturedEnabled(Features.MyFeedOn, flags);

  useEffect(() => {
    if (isOpen) {
      if (alerts?.filter && hasAnyFilter && user) {
        updateAlerts({ filter: false });
      }
    }
  }, [isOpen, alerts, user, hasAnyFilter]);

  const onCreate = () => {
    // apply analytics
    const key = getFeedSettingsQueryKey(user);
    const { feedSettings } = client.getQueryData(key) as AllTagCategoriesData;
    updateLocalFeedSettings(feedSettings);
    window.location.replace(`${process.env.NEXT_PUBLIC_WEBAPP_URL}register`);
  };

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
      <FilterMenu onUnblockItem={setUnblockItem} />
      {unblockItem && (
        <UnblockModal
          item={unblockItem}
          isOpen={!!unblockItem}
          onConfirm={unblockItem.action}
          onRequestClose={() => setUnblockItem(null)}
        />
      )}
    </aside>
  );
}
