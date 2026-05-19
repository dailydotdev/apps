import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import type { StoryItem } from './types';

interface CoverSourcesProps {
  stories: StoryItem[];
  totals: {
    readMinutes: number;
    savedMinutes: number;
    total: number;
  };
}

type SourceTally = {
  sourceId: string;
  sourceName: string;
  sourceImage: string;
  count: number;
};

export const CoverSources = ({
  stories,
  totals,
}: CoverSourcesProps): ReactElement => {
  const sources = useMemo(() => {
    const map = new Map<string, SourceTally>();
    stories.forEach((story) =>
      story.sources.forEach((src) => {
        const existing = map.get(src.sourceId);
        if (existing) {
          existing.count += 1;
          return;
        }
        map.set(src.sourceId, {
          sourceId: src.sourceId,
          sourceName: src.sourceName,
          sourceImage: src.sourceImage,
          count: 1,
        });
      }),
    );
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  }, [stories]);

  const postCount = useMemo(
    () => stories.reduce((sum, s) => sum + s.posts.length, 0),
    [stories],
  );
  const commentCount = useMemo(
    () => stories.reduce((sum, s) => sum + s.totalComments, 0),
    [stories],
  );

  return (
    <section className="flex flex-col gap-4">
      <div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
          bold
          className="mb-2 uppercase tracking-[0.18em]"
        >
          By the numbers
        </Typography>
        <dl className="grid grid-cols-2 gap-3">
          {[
            { label: 'Stories', value: totals.total },
            { label: 'Posts scanned', value: postCount },
            { label: 'Min saved', value: totals.savedMinutes },
            { label: 'Comments read', value: commentCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-10 bg-background-subtle p-3"
            >
              <dt>
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Tertiary}
                  className="uppercase tracking-[0.12em]"
                >
                  {stat.label}
                </Typography>
              </dt>
              <dd className="mt-1">
                <Typography
                  type={TypographyType.Title3}
                  color={TypographyColor.Primary}
                  bold
                  className="tabular-nums !leading-none"
                >
                  {stat.value}
                </Typography>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
          bold
          className="mb-2 uppercase tracking-[0.18em]"
        >
          Top sources today
        </Typography>
        <ul className="flex flex-col">
          {sources.map((src) => (
            <li
              key={src.sourceId}
              className="flex items-center gap-2.5 border-b border-border-subtlest-tertiary py-2 last:border-b-0"
            >
              <span className="size-5 shrink-0 overflow-hidden rounded-full bg-surface-float">
                <img
                  src={src.sourceImage}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              </span>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Primary}
                className="min-w-0 flex-1 truncate"
              >
                {src.sourceName}
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Quaternary}
                bold
                className="tabular-nums"
              >
                {src.count}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
