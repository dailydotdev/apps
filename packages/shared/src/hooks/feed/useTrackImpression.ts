import { useInView } from 'react-intersection-observer';
import { useContext, useEffect } from 'react';
import {
  adAnalyticsEvent,
  feedAnalyticsExtra,
  postAnalyticsEvent,
} from '../../lib/feed';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { FeedItem } from '../useFeed';

const TRACKING = 1;
const TRACKED = 2;

export default function useTrackImpression(
  item: FeedItem,
  index: number,
  columns: number,
  column: number,
  row: number,
  feedName: string,
  ranking?: string,
): (node?: Element | null) => void {
  const { trackEventStart, trackEventEnd } = useContext(AnalyticsContext);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (item.type === 'post') {
      const eventKey = `pi-${item.post.id}`;
      if (inView && !item.post.impressionStatus) {
        trackEventStart(
          eventKey,
          postAnalyticsEvent('impression', item.post, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking, {
              scroll_y: window.scrollY,
            }),
          }),
        );
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = TRACKING;
      } else if (!inView && item.post.impressionStatus === TRACKING) {
        trackEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = TRACKED;
      }
    } else if (item.type === 'ad') {
      const eventKey = `ai-${index}`;
      if (inView && !item.ad.impressionStatus) {
        trackEventStart(
          eventKey,
          adAnalyticsEvent('impression', item.ad, {
            columns,
            column,
            row,
            ...feedAnalyticsExtra(feedName, ranking),
          }),
        );
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = TRACKING;
      } else if (!inView && item.ad.impressionStatus === TRACKING) {
        trackEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = TRACKED;
      }
    }
  }, [inView]);

  useEffect(() => {
    // Send pending impression on unmount
    return () => {
      if (item.type === 'ad' && item.ad.impressionStatus === TRACKING) {
        const eventKey = `ai-${index}`;
        trackEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = TRACKED;
      } else if (
        item.type === 'post' &&
        item.post.impressionStatus === TRACKING
      ) {
        const eventKey = `pi-${item.post.id}`;
        trackEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = TRACKED;
      }
    };
  }, []);

  return inViewRef;
}
