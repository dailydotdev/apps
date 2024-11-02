import { useQuery } from '@tanstack/react-query';
import React, { ReactElement } from 'react';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { fetchTopReaders } from '../../lib/topReader';
import { disabledRefetch } from '../../lib/func';
import { ActivityContainer, ActivitySectionHeader } from './ActivitySection';
import { docs } from '../../lib/constants';
import { MedalBadgeIcon } from '../icons';
import { IconSize } from '../Icon';
import { BadgeIconGoldGradient } from '../badges/BadgeIcon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import type { PublicProfile } from '../../lib/user';

export const TopReaderWidget = ({
  user,
}: {
  user: PublicProfile;
}): ReactElement => {
  const { data: topReader, isLoading: isTopReaderLoading } = useQuery({
    queryKey: generateQueryKey(RequestKey.TopReaderBadge, user, 'latest'),
    queryFn: async () => {
      return await fetchTopReaders(5, user.id);
    },
    staleTime: StaleTime.OneHour,
    ...disabledRefetch,
  });

  if (isTopReaderLoading) {
    return null;
  }

  return (
    <ActivityContainer>
      <ActivitySectionHeader
        title="Badges"
        subtitle="Understand more how this is computed in"
        clickableTitle="daily.dev docs"
        // TODO: add link to specific page in docs
        link={docs}
      />

      {/* TODO: add a null state when the user has no badges */}

      <div className="w-60 rounded-10 border border-border-subtlest-tertiary p-3">
        <div className="flex">
          <MedalBadgeIcon
            secondary
            size={IconSize.XLarge}
            fill="url(#goldGradient)"
          />
          <BadgeIconGoldGradient />
          <div className="flex flex-col">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              bold
            >
              X{topReader[0]?.total ?? 0}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Top reader
            </Typography>
          </div>
        </div>

        {topReader.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {topReader.map((badge) => {
              return (
                <div className="flex justify-between" key={`badge-${badge.id}`}>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Primary}
                    className="rounded-6 border border-border-subtlest-tertiary px-2.5 py-0.5"
                  >
                    {badge.keyword.flags.title}
                  </Typography>
                  <Typography
                    type={TypographyType.Caption2}
                    color={TypographyColor.Quaternary}
                  >
                    {formatDate({
                      value: badge.issuedAt,
                      type: TimeFormatType.TopReaderBadge,
                    })}
                  </Typography>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ActivityContainer>
  );
};
