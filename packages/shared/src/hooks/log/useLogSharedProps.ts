import {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { LogEvent } from './useLogQueue';
import SettingsContext from '../../contexts/SettingsContext';
import AuthContext from '../../contexts/AuthContext';

export default function useLogSharedProps(
  app: string,
  version: string,
  deviceId: string,
): [MutableRefObject<Partial<LogEvent>>, boolean] {
  // Use ref instead of state to reduce renders
  const sharedPropsRef = useRef<Partial<LogEvent>>();
  const { query } = useRouter();
  const { themeMode, spaciness, insaneMode } = useContext(SettingsContext);
  const { visit, anonymous, tokenRefreshed, user } = useContext(AuthContext);
  const [sharedPropsSet, setSharedPropsSet] = useState(false);

  const [visitId, setVisitId] = useState<string>();
  useEffect(() => {
    // Visit ID should be set only at the beginning
    if (tokenRefreshed && !visitId) {
      setVisitId(visit?.visitId);
    }
  }, [tokenRefreshed, visit?.visitId, setVisitId, visitId]);

  useEffect(() => {
    if (!visitId || !deviceId) {
      return;
    }

    const queryObject = { ...query };

    const initialQuerySearchParams = new URLSearchParams(
      window.location.search,
    );

    // initial useRouter.query can be empty on prerendered static pages
    // so we add any missing initial query params to the query object
    // that we pass to log
    initialQuerySearchParams.forEach((value, key) => {
      if (!queryObject[key]) {
        queryObject[key] = value;
      }
    });

    const queryStr = JSON.stringify(queryObject);

    (sharedPropsRef.current?.device_id
      ? Promise.resolve(sharedPropsRef.current.device_id)
      : Promise.resolve(deviceId)
    ).then((_deviceId) => {
      sharedPropsRef.current = {
        app_platform: app,
        app_theme: themeMode,
        app_version: version,
        feed_density: spaciness,
        feed_layout: insaneMode ? 'list' : 'cards',
        // By default query equals '{}'
        query_params: queryStr.length > 2 ? queryStr : undefined,
        session_id: visit?.sessionId,
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
        device_id: _deviceId,
      };
      setSharedPropsSet(true);
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sharedPropsRef,
    tokenRefreshed,
    app,
    version,
    themeMode,
    spaciness,
    insaneMode,
    query,
    visit,
    visitId,
    deviceId,
  ]);

  return [sharedPropsRef, sharedPropsSet];
}
