import { useEffect } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { featureGqlBatching } from '../lib/featureManagement';
import { setGqlBatchingEnabled } from '../graphql/batch';

// The transport is module state, so one mount in the shell drives it for every
// query. The companion content script keeps its own request protocol and never
// goes through here.
export const useGqlBatchingFlag = (): void => {
  const isEnabled = useFeature(featureGqlBatching);

  useEffect(() => {
    setGqlBatchingEnabled(!!isEnabled);
  }, [isEnabled]);
};
