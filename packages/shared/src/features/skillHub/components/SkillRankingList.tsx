import type { ReactElement } from 'react';
import React from 'react';
import type { Skill } from '../types';
import { LeaderboardList } from '../../../components/cards/Leaderboard/LeaderboardList';
import { LeaderboardListItem } from '../../../components/cards/Leaderboard/LeaderboardListItem';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { UpvoteIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { largeNumberFormat } from '../../../lib/numberFormat';

interface SkillRankingListProps {
  title: string;
  skills: Skill[];
  className?: string;
}

export const SkillRankingList = ({
  title,
  skills,
  className,
}: SkillRankingListProps): ReactElement => {
  return (
    <LeaderboardList containerProps={{ title, className }} isLoading={false}>
      {skills.map((skill, index) => (
        <LeaderboardListItem
          key={skill.id}
          index={index + 1}
          concatScore={false}
          className="py-1"
        >
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="min-w-0">
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                className="truncate"
              >
                {skill.displayName}
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Caption1}
                className="text-text-tertiary"
              >
                {skill.author.name}
              </Typography>
            </div>
            <div className="flex items-center gap-1 text-text-tertiary">
              <UpvoteIcon size={IconSize.Size16} />
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
              >
                {largeNumberFormat(skill.upvotes) || '0'}
              </Typography>
            </div>
          </div>
        </LeaderboardListItem>
      ))}
    </LeaderboardList>
  );
};
