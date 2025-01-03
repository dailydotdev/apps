import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  ActivityContainer,
  ActivitySectionHeader,
  ActivitySectionSubTitle,
} from './ActivitySection';
import { topReaderBadgeDocs } from '../../lib/constants';
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
import { getTagPageLink } from '../../lib';
import { truncateTextClassNames } from '../utilities';

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

      <div className="min-w-60 max-w-fit rounded-10 border border-border-subtlest-tertiary p-3">
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
                  href={getTagPageLink(badge.keyword.value)}
                  passHref
                  prefetch={false}
                >
                  <Typography
                    tag={TypographyTag.Link}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Primary}
                    className={classNames(
                      'max-w-[32ch] rounded-6 border border-border-subtlest-tertiary px-2.5 py-0.5 transition duration-200 hover:bg-background-popover',
                      truncateTextClassNames,
                    )}
                  >
                    {badge.keyword.flags?.title || badge.keyword.value}
                  </Typography>
                </Link>
                <Typography
                  tag={TypographyTag.Time}
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  dateTime={new Date(badge.issuedAt).toISOString()}
                  className="ml-8 self-center"
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
