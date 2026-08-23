import type { ReactElement } from 'react';
import React from 'react';
import { DevCardTheme, themeToLinearGradient } from '../profile/devcard';
import type { TopReader } from './TopReaderBadge';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';

export const TopReaderBadgeCompact = ({
  issuedAt,
  keyword,
}: Pick<TopReader, 'issuedAt' | 'keyword'>): ReactElement => {
  const formattedDate = formatDate({
    value: issuedAt,
    type: TimeFormatType.TopReaderBadge,
  });

  return (
    <div className="flex w-max min-w-36 flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 text-center">
      <Typography type={TypographyType.Callout} bold>
        Top reader
      </Typography>

      <Typography
        tag={TypographyTag.Time}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        dateTime={new Date(issuedAt).toISOString()}
      >
        {formattedDate}
      </Typography>

      <div
        className="mt-1 rounded-8 px-3 py-1"
        style={{ backgroundImage: themeToLinearGradient[DevCardTheme.Gold] }}
      >
        <Typography
          type={TypographyType.Subhead}
          bold
          className="whitespace-nowrap text-black"
        >
          {keyword.flags?.title || keyword.value}
        </Typography>
      </div>
    </div>
  );
};
