import { useInView } from 'react-intersection-observer';
import { useContext, useEffect } from 'react';
import { adLogEvent, feedLogExtra, usePostLogEvent } from '../../lib/feed';
import { LogEvent } from '../../lib/log';
import LogContext from '../../contexts/LogContext';
import type { FeedItem } from '../useFeed';
import { PostType } from '../../graphql/posts';

export enum ImpressionStatus {
  LOGGING = 1,
  LOGGED = 2,
}

export const generateAdLogEventKey = (index: number): string => `ai-${index}`;
export const generatePostLogEventKey = (id: string): string => `pi-${id}`;

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
  const postLogEvent = usePostLogEvent();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (item.type === 'post') {
      const eventKey = generatePostLogEventKey(item.post.id);
      if (inView && !item.post.impressionStatus) {
        logEventStart(
          eventKey,
          postLogEvent(LogEvent.Impression, item.post, {
            columns,
            column,
            row,
            extra: {
              ...feedLogExtra(feedName, ranking, {
                scroll_y: window.scrollY,
              }).extra,
              clickbait_badge:
                item.post.type === PostType.Share
                  ? item.post.sharedPost.clickbaitTitleDetected
                  : item.post.clickbaitTitleDetected,
              feedback: item.post.type === PostType.Article ? true : undefined,
            },
          }),
        );
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = ImpressionStatus.LOGGING;
      } else if (
        !inView &&
        item.post.impressionStatus === ImpressionStatus.LOGGING
      ) {
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = ImpressionStatus.LOGGED;
      }
    } else if (item.type === 'ad') {
      const eventKey = generateAdLogEventKey(index);
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
        item.ad.impressionStatus = ImpressionStatus.LOGGING;
      } else if (
        !inView &&
        item.ad.impressionStatus === ImpressionStatus.LOGGING
      ) {
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = ImpressionStatus.LOGGED;
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, item]);

  useEffect(() => {
    // Send pending impression on unmount
    return () => {
      if (
        item.type === 'ad' &&
        item.ad.impressionStatus === ImpressionStatus.LOGGING
      ) {
        const eventKey = generateAdLogEventKey(index);
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.ad.impressionStatus = ImpressionStatus.LOGGED;
      } else if (
        item.type === 'post' &&
        item.post.impressionStatus === ImpressionStatus.LOGGING
      ) {
        const eventKey = generatePostLogEventKey(item.post.id);
        logEventEnd(eventKey);
        // eslint-disable-next-line no-param-reassign
        item.post.impressionStatus = ImpressionStatus.LOGGED;
      }
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return inViewRef;
}
