import { webappUrl } from '../../../lib/constants';

export const highlightsTitleGradientClassName =
  'feed-highlights-title-gradient';

const HIGHLIGHTS_URL = `${webappUrl}highlights`;

export const getHighlightsUrl = (highlightId?: string): string =>
  highlightId ? `${HIGHLIGHTS_URL}?highlight=${highlightId}` : HIGHLIGHTS_URL;
