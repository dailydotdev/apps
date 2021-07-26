import { isSameDay } from 'date-fns';
import usePersistentState from './usePersistentState';
import { Ad } from '../graphql/posts';
import { logRevenue, trackEvent } from '../lib/analytics';

type State = { lastSent: Date; count: number };
type UseAdImpressionsRet = { onAdImpression: (ad: Ad) => Promise<void> };

export default function useAdImpressions(): UseAdImpressionsRet {
  const [state, setState] = usePersistentState<State>(
    'events',
    null,
    { lastSent: new Date(0), count: 0 },
    true,
  );

  const onAdImpression = async (ad: Ad): Promise<void> => {
    if (ad.impressionTracked) {
      return;
    }
    // eslint-disable-next-line no-param-reassign
    ad.impressionTracked = true;
    trackEvent({
      category: 'Ad',
      action: 'Impression',
      label: ad.source,
      nonInteraction: true,
    });
    if (ad.providerId?.length) {
      const now = new Date();
      if (state) {
        if (isSameDay(now, state.lastSent)) {
          await setState({ ...state, count: state.count + 1 });
        } else {
          await logRevenue('grouped impressions', state.count + 1);
          await setState({ lastSent: now, count: 0 });
        }
      }
    }
  };

  return {
    onAdImpression,
  };
}
