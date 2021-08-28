import {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { AnalyticsEvent } from './useAnalyticsQueue';
import FeaturesContext from '../../contexts/FeaturesContext';
import SettingsContext from '../../contexts/SettingsContext';
import AuthContext from '../../contexts/AuthContext';

export default function useAnalyticsSharedProps(
  app: string,
  version: string,
): [MutableRefObject<Partial<AnalyticsEvent>>, boolean] {
  // Use ref instead of state to reduce renders
  const sharedPropsRef = useRef<Partial<AnalyticsEvent>>();
  const { query } = useRouter();
  const { flags } = useContext(FeaturesContext);
  const { themeMode, spaciness, insaneMode } = useContext(SettingsContext);
  const { anonymous, tokenRefreshed, user } = useContext(AuthContext);
  const [sharedPropsSet, setSharedPropsSet] = useState(false);

  const [visitId, setVisitId] = useState<string>();
  useEffect(() => {
    // Visit ID should be set only at the beginning
    if (tokenRefreshed && !visitId) {
      setVisitId(anonymous?.visitId);
    }
  }, [tokenRefreshed, anonymous?.visitId, setVisitId, visitId]);

  useEffect(() => {
    if (!visitId) {
      return;
    }
    setSharedPropsSet(true);
    const queryStr = JSON.stringify(query);
    sharedPropsRef.current = {
      app_platform: app,
      app_theme: themeMode,
      app_version: version,
      feed_density: spaciness,
      feed_layout: insaneMode ? 'list' : 'cards',
      // By default query equals '{}'
      query_params: queryStr.length > 2 ? queryStr : undefined,
      session_id: anonymous?.sessionId,
      user_first_visit: anonymous?.firstVisit,
      user_id: anonymous?.id,
      user_referrer: anonymous?.referrer,
      user_registration_date: user?.createdAt,
      utm_campaign: query?.utm_campaign,
      utm_content: query?.utm_content,
      utm_medium: query?.utm_medium,
      utm_source: query?.utm_source,
      utm_term: query?.utm_term,
      visit_id: visitId,
      feature_flags: flags ? JSON.stringify(flags) : null,
    };
  }, [
    sharedPropsRef,
    tokenRefreshed,
    app,
    version,
    themeMode,
    spaciness,
    insaneMode,
    query,
    anonymous,
    visitId,
    flags,
  ]);

  return [sharedPropsRef, sharedPropsSet];
}
