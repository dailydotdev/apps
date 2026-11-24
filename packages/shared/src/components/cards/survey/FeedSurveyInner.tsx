import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type { FeedSurvey } from '../../../graphql/feedSurvey';
import { answerFeedSurvey } from '../../../graphql/feedSurvey';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { feedLogExtra } from '../../../lib/feed';
import { LogEvent, TargetType } from '../../../lib/log';
import { labels } from '../../../lib/labels';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { FeedbackIcon, VIcon } from '../../icons';
import { IconSize } from '../../Icon';

export interface FeedSurveyCardProps {
  survey: FeedSurvey;
  feedMeta: string | null;
  feedName: string;
  ranking?: string;
  columns: number;
  column: number;
  row: number;
}

export const FeedSurveyInner = ({
  survey,
  feedMeta,
  feedName,
  ranking,
  columns,
  column,
  row,
}: FeedSurveyCardProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const isImpressionLogged = useRef(false);

  const getLogEvent = (
    eventName: LogEvent,
    extra?: Record<string, unknown>,
  ) => ({
    event_name: eventName,
    target_type: TargetType.FeedSurvey,
    target_id: survey.id,
    feed_grid_columns: columns,
    feed_item_grid_column: column,
    feed_item_grid_row: row,
    feed_item_meta: feedMeta ?? undefined,
    extra: JSON.stringify({
      ...feedLogExtra(feedName, ranking).extra,
      ...extra,
    }),
  });

  useEffect(() => {
    if (!inView || isImpressionLogged.current) {
      return;
    }
    isImpressionLogged.current = true;
    logEvent(getLogEvent(LogEvent.Impression));
    // Logged once, when the card is first seen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Kept in the query cache, so a card that is mounted again (the feed is
  // virtualised) does not ask a question that was just answered.
  const queryClient = useQueryClient();
  const answeredKey = ['feedSurveyAnswered', survey.id];
  const { data: isAnswered } = useQuery({
    queryKey: answeredKey,
    queryFn: () => false,
    initialData: false,
    staleTime: Infinity,
    enabled: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (optionId: string) =>
      answerFeedSurvey({ surveyId: survey.id, optionId }),
    onSuccess: () => queryClient.setQueryData(answeredKey, true),
    onError: () => displayToast(labels.error.generic),
  });

  const onAnswer = (optionId: string, text: string) => {
    if (isPending) {
      return;
    }
    logEvent(
      getLogEvent(LogEvent.AnswerFeedSurvey, {
        option_id: optionId,
        option: text,
      }),
    );
    mutate(optionId);
  };

  if (isAnswered) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-accent-cabbage-default text-white">
          <VIcon secondary size={IconSize.Medium} />
        </span>
        <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
          Thanks for your feedback
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          It helps us make your feed better.
        </Typography>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-1 flex-col justify-center gap-4">
      <div className="flex flex-col gap-2">
        <span className="flex w-fit items-center gap-1 rounded-8 bg-overlay-float-cabbage px-2 py-1 font-bold text-accent-cabbage-default typo-footnote">
          <FeedbackIcon secondary size={IconSize.XSmall} />
          Quick question
        </span>
        <Typography tag={TypographyTag.H3} type={TypographyType.Title2} bold>
          {survey.question}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          One tap. Your answer helps us improve your feed.
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        {survey.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={isPending}
            onClick={() => onAnswer(option.id, option.text)}
            className="flex h-12 w-full items-center justify-center rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 font-bold text-text-primary transition-colors typo-callout hover:border-accent-cabbage-default hover:bg-overlay-float-cabbage focus-visible:border-accent-cabbage-default disabled:opacity-64"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};
