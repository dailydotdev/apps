import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { WorldTopic } from '../../graphql/worldIndex';
import { domainStyle } from './worldIndexDomains';

interface WorldTopicBarsProps {
  topics: WorldTopic[];
  className?: string;
}

/**
 * What a world is made of, said in words rather than drawn as a picture.
 *
 * An abstract mark of the world reads as decoration at this size: it says a
 * world is big or small and nothing else. The claim worth making on a card is
 * which subjects this person actually reads, and labelled bars make it in a
 * form nobody has to be taught to read.
 */
export function WorldTopicBars({
  topics,
  className,
}: WorldTopicBarsProps): ReactElement | null {
  if (!topics.length) {
    return null;
  }

  const max = Math.max(...topics.map((topic) => topic.articles));

  return (
    <div className={classNames('flex flex-col gap-1.5', className)}>
      {topics.map((topic) => {
        const domain = domainStyle(topic.niche.domain);

        return (
          <div key={topic.niche.id} className="flex items-center gap-2">
            {/* The title takes the slack and the bar is fixed, rather than the
                other way round: niche titles run to "JavaScript / TypeScript
                ecosystem", and a bar is still comparable at any width so long
                as every row shares it. It wraps rather than clipping, so the
                row grows a line instead of hiding half a subject. */}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
              className="min-w-0 flex-1 break-words"
            >
              {topic.niche.title}
            </Typography>

            <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-8 bg-accent-pepper-subtler">
              <span
                className="block h-full rounded-8"
                style={{
                  width: `${Math.round((topic.articles / max) * 100)}%`,
                  backgroundColor: domain.accent,
                }}
              />
            </span>

            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="w-10 shrink-0 text-right tabular-nums"
            >
              {topic.articles.toLocaleString()}
            </Typography>
          </div>
        );
      })}
    </div>
  );
}
