import { useInView } from 'react-intersection-observer';
import { useContext, useEffect } from 'react';
import { adLogEvent, feedLogExtra, postLogEvent } from '../../lib/feed';
import LogContext from '../../contexts/LogContext';
import { FeedItem } from '../useFeed';
import { PostType } from '../../graphql/posts';

const LOGGING = 1;
const LOGGED = 2;

export default function useLogImpression(
  item: FeedItem,
  index: number,
  columns: number,
  column: number,
  row: number,
  feedName: string,
  ranking?: string,
): (node?: Element | null) => void {
  const { logEventStart, logEventEnd } = useContext(LogContext);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (item.type === 'post') {
      const eventKey = `pi-${item.post.id}`;
      if (inView && !item.post.impressionStatus) {
        logEventStart(
          eventKey,
          postLogEvent('impression', item.post, {
            columns,
            column,
            row,
            extra: {
              ...feedLogExtra(feedName, ranking, {
                scroll_y: window.scrollY,
              }).extra,
              feedback: item.post.type === PostType.Article ? true : undefined,
            },
          }),
        );
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = LOGGING;
      } else if (!inView && item.post.impressionStatus === LOGGING) {
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = LOGGED;
      }
    } else if (item.type === 'ad') {
      const eventKey = `ai-${index}`;
      if (inView && !item.ad.impressionStatus) {
        logEventStart(
          eventKey,
          adLogEvent('impression', item.ad, {
            columns,
            column,
            row,
            ...feedLogExtra(feedName, ranking),
          }),
        );
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = LOGGING;
      } else if (!inView && item.ad.impressionStatus === LOGGING) {
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = LOGGED;
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => {
    // Send pending impression on unmount
    return () => {
      if (item.type === 'ad' && item.ad.impressionStatus === LOGGING) {
        const eventKey = `ai-${index}`;
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = LOGGED;
      } else if (
        item.type === 'post' &&
        item.post.impressionStatus === LOGGING
      ) {
        const eventKey = `pi-${item.post.id}`;
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = LOGGED;
      }
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return inViewRef;
}
