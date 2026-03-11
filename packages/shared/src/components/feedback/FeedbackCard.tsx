import type { ReactElement } from 'react';
import React from 'react';
import { format } from 'date-fns';
import { Button, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { FeedbackItem } from '../../graphql/feedback';
import {
  getFeedbackCategoryLabel,
  getFeedbackStatusClassName,
  getFeedbackStatusLabel,
} from '../../lib/feedback';

type FeedbackCardProps = {
  item: FeedbackItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export const FeedbackCard = ({
  item,
  isExpanded,
  onToggleExpand,
}: FeedbackCardProps): ReactElement => {
  const isLongDescription = item.description.length > 260;
  const description = isExpanded
    ? item.description
    : item.description.slice(0, 260);
  const badgeClassName = 'rounded-14 bg-surface-hover px-2 py-1 text-xs';

  return (
    <article className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`${badgeClassName} text-text-secondary`}>
          {getFeedbackCategoryLabel(item.category)}
        </span>
        <span
          className={`${badgeClassName} ${getFeedbackStatusClassName(
            item.status,
          )}`}
        >
          {getFeedbackStatusLabel(item.status)}
        </span>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="ml-auto"
        >
          {format(new Date(item.createdAt), 'dd MMM yyyy')}
        </Typography>
      </div>

      <Typography
        type={TypographyType.Body}
        className="mt-3 whitespace-pre-wrap"
      >
        {description}
        {isLongDescription && !isExpanded ? '...' : ''}
      </Typography>

      {isLongDescription && (
        <Button
          className="mt-2"
          variant={ButtonVariant.Tertiary}
          onClick={onToggleExpand}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}

      {item.screenshotUrl && (
        <a
          href={item.screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block"
        >
          <img
            src={item.screenshotUrl}
            alt="Feedback screenshot"
            className="max-h-48 w-auto rounded-12 border border-border-subtlest-tertiary"
          />
        </a>
      )}

      {item.replies.length > 0 && (
        <div className="mt-4 border-t border-border-subtlest-tertiary pt-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mb-3"
          >
            Replies
          </Typography>

          <div className="flex flex-col gap-3">
            {item.replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-12 bg-surface-hover px-3 py-2"
              >
                <Typography type={TypographyType.Footnote} bold>
                  {`${reply.authorName || 'daily.dev team'} from daily.dev`}
                </Typography>
                <Typography
                  type={TypographyType.Callout}
                  className="mt-1 whitespace-pre-wrap"
                >
                  {reply.body}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="mt-2"
                >
                  {format(new Date(reply.createdAt), 'dd MMM yyyy')}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
