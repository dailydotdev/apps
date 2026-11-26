import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import type { FeedSurvey, FeedSurveyOption } from '../../../graphql/feedSurvey';
import { answerFeedSurvey } from '../../../graphql/feedSurvey';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { feedLogExtra } from '../../../lib/feed';
import { LogEvent, TargetType } from '../../../lib/log';
import { labels } from '../../../lib/labels';
import { webappUrl } from '../../../lib/constants';
import { shuffleArray } from '../../../lib/func';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
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

// A tint only: the feed layout keeps every card's border the same colour
export const feedSurveyCardStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 24%, transparent), transparent 70%)',
};

type FeedSurveyThanks = {
  title: string;
  body: string;
  links?: { label: string; href: string }[];
};

const tagsUrl = `${webappUrl}settings/feed/tags`;
const filtersUrl = `${webappUrl}settings/feed/filters`;

const defaultThanks: FeedSurveyThanks = {
  title: 'Thanks for your feedback',
  body: 'It helps us make your feed better.',
};

// What the card says after an answer, by the option's key. The first link is
// the main action.
const thanksByKey: Record<string, FeedSurveyThanks> = {
  yes: {
    title: 'Glad to hear it. Thanks!',
    body: 'Your answer helps us keep your feed this good.',
  },
  repeats: {
    title: 'Thanks, noted.',
    body: 'Following a few new topics brings fresh posts into your feed.',
    links: [{ label: 'Find new topics', href: tagsUrl }],
  },
  wrong_topics: {
    title: "Thanks, let's fix that.",
    body: "Pick the topics you care about and drop the ones you don't.",
    links: [
      { label: 'Edit my topics', href: tagsUrl },
      { label: 'Block a topic', href: filtersUrl },
    ],
  },
  not_useful: {
    title: 'Thanks, noted.',
    body: "Block the sources or types of posts you don't want, and your feed will improve.",
    links: [{ label: 'Adjust my filters', href: filtersUrl }],
  },
};

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
  // virtualised) keeps its option order and does not ask a question that was
  // just answered.
  const queryClient = useQueryClient();
  const answeredKey = ['feedSurveyAnswered', survey.id];
  const { data: answeredOption } = useQuery<FeedSurveyOption | null>({
    queryKey: answeredKey,
    queryFn: () => null,
    initialData: null,
    staleTime: Infinity,
    enabled: false,
  });
  // Shuffled once per survey, so the position of an option does not favour it
  const { data: options } = useQuery({
    queryKey: ['feedSurveyOptions', survey.id],
    queryFn: () => shuffleArray(survey.options),
    initialData: () => shuffleArray(survey.options),
    staleTime: Infinity,
    enabled: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (option: FeedSurveyOption) =>
      answerFeedSurvey({ surveyId: survey.id, optionId: option.id }),
    onSuccess: (_, option) => queryClient.setQueryData(answeredKey, option),
    onError: () => displayToast(labels.error.generic),
  });

  const onAnswer = (option: FeedSurveyOption, position: number) => {
    if (isPending) {
      return;
    }
    logEvent(
      getLogEvent(LogEvent.AnswerFeedSurvey, {
        option_id: option.id,
        option: option.text,
        option_key: option.key ?? undefined,
        position,
      }),
    );
    mutate(option);
  };

  if (answeredOption) {
    const thanks =
      (answeredOption.key && thanksByKey[answeredOption.key]) || defaultThanks;

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-accent-cabbage-default text-white">
          <VIcon secondary size={IconSize.Medium} />
        </span>
        <Typography tag={TypographyTag.H3} type={TypographyType.Title3} bold>
          {thanks.title}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {thanks.body}
        </Typography>
        {thanks.links?.map(({ label, href }, index) => (
          <Button
            key={label}
            tag="a"
            href={href}
            className={index === 0 ? 'mt-2 w-full' : 'w-full'}
            variant={index === 0 ? ButtonVariant.Primary : ButtonVariant.Float}
            size={ButtonSize.Medium}
            onClick={() =>
              logEvent(
                getLogEvent(LogEvent.Click, {
                  option_key: answeredOption.key ?? undefined,
                  cta: label,
                }),
              )
            }
          >
            {label} →
          </Button>
        ))}
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
        {options.map((option, position) => (
          <button
            key={option.id}
            type="button"
            disabled={isPending}
            onClick={() => onAnswer(option, position)}
            className="flex h-12 w-full items-center justify-center rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 font-bold text-text-primary transition-colors typo-callout hover:border-accent-cabbage-default hover:bg-overlay-float-cabbage focus-visible:border-accent-cabbage-default disabled:opacity-64"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};
