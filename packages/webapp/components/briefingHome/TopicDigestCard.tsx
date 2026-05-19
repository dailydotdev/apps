import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { TOPIC_TOKEN, type TopicDigest } from './types';
import { briefCopy } from './copy';

interface TopicDigestCardProps {
  topic: TopicDigest;
  isRead: boolean;
  onRead: () => void;
}

export const TopicDigestCard = ({
  topic,
  isRead,
  onRead,
}: TopicDigestCardProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        onRead();
      }
      return next;
    });
  }, [onRead]);

  const accentClass = TOPIC_TOKEN[topic.topic];

  return (
    <article
      className={classNames(
        'flex flex-col rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-5 transition-opacity',
        isRead && !open && 'opacity-60',
      )}
    >
      <button type="button" onClick={toggle} className="text-left">
        <Typography
          type={TypographyType.Caption1}
          bold
          className={classNames(
            'mb-2 uppercase tracking-[0.16em]',
            accentClass,
          )}
        >
          {topic.topic}
        </Typography>
        <Typography
          type={TypographyType.Title3}
          bold
          color={isRead ? TypographyColor.Tertiary : TypographyColor.Primary}
          className={classNames(
            '!leading-snug',
            isRead && 'decoration-text-quaternary/40 line-through',
          )}
        >
          {topic.title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="mt-2"
        >
          {briefCopy.topicWeekly}
        </Typography>
      </button>

      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="mt-4 !leading-relaxed"
      >
        {topic.tldr}
      </Typography>

      <div
        className={classNames(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="prose prose-sm mt-4 max-w-none text-text-tertiary [&_code]:rounded-4 [&_code]:bg-surface-float [&_code]:px-1 [&_code]:text-text-primary [&_h2]:mb-1 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text-primary [&_li]:my-1 [&_p]:my-2 [&_strong]:text-text-primary [&_ul]:list-disc [&_ul]:pl-5"
            // mock data is trusted markdown converted to HTML at build time
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: topic.content }}
          />
        </div>
      </div>

      <div className="mt-4 flex">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          onClick={toggle}
          icon={
            <ArrowIcon
              className={classNames(
                'transition-transform',
                open ? 'rotate-0' : 'rotate-180',
              )}
            />
          }
          iconSecondaryOnHover
        >
          {open ? briefCopy.topicCollapse : briefCopy.topicExpand}
        </Button>
      </div>
    </article>
  );
};
