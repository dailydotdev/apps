import type { NextRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import { webappUrl } from '../../lib/constants';

/**
 * Happening now as a tab of the home page on a phone: the highlights swap in
 * under the widget rail and its tabs, like Following and the custom feeds do,
 * instead of opening the highlights page without them. The address shows the
 * highlights page (a direct load or a share opens it as usual), while the
 * route stays the feed page on screen, carrying the view in this param.
 */
const HOME_VIEW_PARAM = 'homeView';
const highlightsPath = 'highlights';

export interface HomeHighlightsView {
  channel?: string;
  isAll?: boolean;
}

export const getHomeHighlightsView = (
  query: ParsedUrlQuery | undefined,
): HomeHighlightsView | null => {
  const value = query?.[HOME_VIEW_PARAM];
  if (typeof value !== 'string') {
    return null;
  }
  const [base, sub] = value.split('/');
  if (base !== highlightsPath) {
    return null;
  }
  if (!sub) {
    return {};
  }

  return sub === 'all' ? { isAll: true } : { channel: sub };
};

const getViewPath = ({ channel, isAll }: HomeHighlightsView): string => {
  if (isAll) {
    return `${highlightsPath}/all`;
  }

  return channel ? `${highlightsPath}/${channel}` : highlightsPath;
};

export const showHomeHighlights = (
  router: NextRouter,
  view: HomeHighlightsView,
): Promise<boolean> => {
  const path = getViewPath(view);
  const query = Object.fromEntries(
    Object.entries(router.query).filter(([key]) => key !== HOME_VIEW_PARAM),
  );

  return router.replace(
    { pathname: router.pathname, query: { ...query, [HOME_VIEW_PARAM]: path } },
    `${webappUrl}${path}`,
    { shallow: true, scroll: false },
  );
};
