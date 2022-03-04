import { useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import usePersistentState from './usePersistentState';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import { BannerData, BANNER_QUERY } from '../graphql/banner';
import { apiUrl } from '../lib/config';
import { laptop } from '../styles/media';

export const footerNavBarBreakpoint = laptop;

export default function usePromotionalBanner(): {
  bannerData: BannerData;
  setLastSeen: (value: Date) => Promise<void>;
} {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [lastSeen, setLastSeen] = usePersistentState(
    'lastSeenBanner',
    null,
    new Date(0),
  );
  const { data: bannerData } = useQuery<BannerData>(
    ['banner', lastSeen?.getTime()],
    () => request(`${apiUrl}/graphql`, BANNER_QUERY, { lastSeen }),
    {
      enabled: windowLoaded && !!lastSeen,
    },
  );

  return useMemo(() => {
    return {
      bannerData,
      setLastSeen,
    };
  }, [bannerData]);
}
