import type { ReactElement } from 'react';
import React from 'react';
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
      className="rounded-24 text-text-primary relative flex size-80 p-1 text-center"
      style={{
        backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
      }}
    >
      <div className="z-1 rounded-20 flex max-w-full flex-1 flex-col items-center px-3 py-5">
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
          className="rounded-12 relative my-5 max-w-max p-1"
          style={{
            backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
          }}
        >
          <div className="rounded-8 relative overflow-hidden px-2 py-0.5">
            <Typography
              type={TypographyType.Title2}
              bold
              className="z-1 relative text-black"
            >
              {keyword.flags?.title || keyword.value}
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
          <LogoText className={{ container: 'h-logo ml-1' }} />
        </div>
      </div>
      <div className="absolute left-0 top-0 z-0 h-full w-full p-1">
        <img
          src={cloudinaryTopReaderBadgeBackground}
          alt="Badge background"
          className="rounded-20 bg-background-default left-0 top-0 h-full w-full"
          aria-hidden
        />
      </div>
    </div>
  );
};
