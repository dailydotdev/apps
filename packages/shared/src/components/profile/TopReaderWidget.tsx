import React, { ReactElement } from 'react';
import {
  ActivityContainer,
  ActivitySectionHeader,
  ActivitySectionSubTitle,
} from './ActivitySection';
import { topReaderBadgeDocs, webappUrl } from '../../lib/constants';
import { MedalBadgeIcon } from '../icons';
import { IconSize } from '../Icon';
import { BadgeIconGoldGradient } from '../badges/BadgeIcon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import type { PublicProfile } from '../../lib/user';
import { ClickableText } from '../buttons/ClickableText';
import { useTopReader } from '../../hooks/useTopReader';
import Link from '../utilities/Link';

export const TopReaderWidget = ({
  user,
}: {
  user: PublicProfile;
}): ReactElement => {
  const { data: topReaders, isPending: isTopReaderLoading } = useTopReader({
    user,
    limit: 5,
  });

  if (isTopReaderLoading || topReaders?.length === 0) {
    return null;
  }

  return (
    <ActivityContainer>
      <ActivitySectionHeader className="flex-wrap" title="Badges">
        <ActivitySectionSubTitle className="w-full">
          Understand more how this is computed in&nbsp;
          <ClickableText
            className="!inline"
            tag="a"
            target="_blank"
            href={topReaderBadgeDocs}
          >
            daily.dev docs
          </ClickableText>
        </ActivitySectionSubTitle>
      </ActivitySectionHeader>

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
              X{topReaders[0]?.total ?? 0}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Top reader
            </Typography>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {topReaders.map((badge) => {
            return (
              <div className="flex justify-between" key={`badge-${badge.id}`}>
                <Link
                  href={`${webappUrl}/tags/${badge.keyword.value}`}
                  passHref
                >
                  <Typography
                    tag={TypographyTag.Link}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Primary}
                    className="rounded-6 border border-border-subtlest-tertiary px-2.5 py-0.5"
                  >
                    {badge.keyword.flags.title}
                  </Typography>
                </Link>
                <Typography
                  tag={TypographyTag.Time}
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  dateTime={new Date(badge.issuedAt).toISOString()}
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
      </div>
    </ActivityContainer>
  );
};
