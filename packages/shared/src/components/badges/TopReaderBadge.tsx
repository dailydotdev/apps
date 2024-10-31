import React, { ReactElement } from 'react';
import { DevCardTheme, themeToLinearGradient } from '../profile/devcard';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import type { LoggedUser } from '../../lib/user';
import type { Keyword } from '../../graphql/keywords';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { BadgeIcon } from './BadgeIcon';

export const TopReaderBadge = ({
  user,
  issuedAt,
  keyword,
}: {
  user: Pick<LoggedUser, 'name' | 'image' | 'username'>;
  issuedAt: Date;
  keyword: Pick<Keyword, 'value' | 'flags'>;
}): ReactElement => {
  const { name, username, image } = user;
  const formattedDate = new Date(issuedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div
      className="flex h-80 w-80 rounded-24 p-1 text-center text-text-primary"
      style={{
        backgroundImage: themeToLinearGradient[DevCardTheme.Gold],
      }}
    >
      <div className="flex max-w-full flex-1 flex-col items-center rounded-20 bg-background-default bg-[url('https://daily-now-res.cloudinary.com/image/upload/s--hQ68GsbF--/f_auto,q_auto/v1730356819/webapp/image_7')] bg-cover px-3 py-5">
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
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
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
    </div>
  );
};
