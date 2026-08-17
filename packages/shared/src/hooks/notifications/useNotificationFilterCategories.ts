import { useMemo } from 'react';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureInterestAgent } from '../../lib/featureManagement';
import {
  NotificationFilterCategory,
  notificationFilterCategoryList,
} from '../../components/notifications/utils';

export const useNotificationFilterCategories = ({
  shouldEvaluate,
}: {
  shouldEvaluate?: boolean;
} = {}): NotificationFilterCategory[] => {
  const { value: showAgent } = useConditionalFeature({
    feature: featureInterestAgent,
    shouldEvaluate,
  });

  return useMemo(
    () =>
      showAgent
        ? notificationFilterCategoryList
        : notificationFilterCategoryList.filter(
            (category) => category !== NotificationFilterCategory.Agent,
          ),
    [showAgent],
  );
};
