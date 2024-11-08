import React, { ReactElement } from 'react';
import { DevCardTheme, themeToLinearGradient } from '../profile/devcard';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import type { LoggedUser } from '../../lib/user';
import type { Keyword } from '../../graphql/keywords';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { BadgeIcon } from './BadgeIcon';
import { cloudinaryTopReaderBadgeBackground } from '../../lib/image';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';

export type TopReader = {
  id: string;
  total: number;
  user: Pick<LoggedUser, 'name' | 'image' | 'username'>;
  issuedAt: Date | string;
  keyword: Pick<Keyword, 'value' | 'flags'>;
  image?: string;
};

export const TopReaderBadge = ({
  user,
  issuedAt,
  keyword,
}: Pick<TopReader, 'user' | 'issuedAt' | 'keyword'>): ReactElement => {
  const { name, username, image } = user;
  const formattedDate = formatDate({
    value: issuedAt,
    type: TimeFormatType.TopReaderBadge,
  });

  return (
    <div
      className="relative flex size-80 rounded-24 p-1 text-center text-text-primary"
      style={{
        backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
      }}
    >
      <div className="z-1 flex max-w-full flex-1 flex-col items-center rounded-20 px-3 py-5">
        <div className="flex justify-center pb-1">
          <BadgeIcon imageUrl={image} />
        </div>

        <Typography type={TypographyType.Footnote} truncate bold>
          {name}
        </Typography>

        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Secondary}
          truncate
          className="pb-1"
        >
          @{username}
        </Typography>

        <Typography type={TypographyType.Title2} bold className="pb-1">
          Top reader
        </Typography>

        <Typography
          tag={TypographyTag.Time}
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          dateTime={new Date(issuedAt).toISOString()}
        >
          {formattedDate}
        </Typography>

        <div
          className="relative my-5 max-w-max rounded-12 p-1"
          style={{
            backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
          }}
        >
          <div className="relative overflow-hidden rounded-8 px-2 py-0.5">
            <Typography
              type={TypographyType.Title2}
              bold
              className="relative z-1 text-black"
            >
              {keyword.flags?.title}
            </Typography>
            <div
              className="absolute left-0 top-0 z-0 h-full w-full -scale-x-100"
              style={{
                backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
              }}
            />
          </div>
        </div>
        <div className="flex">
          <LogoIcon className={{ container: 'h-logo' }} />
          <LogoText className={{ container: 'ml-1 h-logo' }} />
        </div>
      </div>
      <div className="absolute left-0 top-0 z-0 h-full w-full p-1">
        <img
          src={cloudinaryTopReaderBadgeBackground}
          alt="Badge background"
          className="left-0 top-0 h-full w-full rounded-20 bg-background-default"
          aria-hidden
        />
      </div>
    </div>
  );
};
