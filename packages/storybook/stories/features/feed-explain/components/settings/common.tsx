import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Divider } from '@dailydotdev/shared/src/components/utilities/Divider';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

/** A setting's title and description, as the feed settings sections set them. */
export const SettingHeader = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography bold type={TypographyType.Body}>
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </div>
);

export const SettingDivider = (): ReactElement => (
  <Divider className="my-1 bg-border-subtlest-tertiary" />
);

/** One line where a list used to be, linking to the page that owns it. */
export const BlockedNote = ({
  text,
  onOpen,
}: {
  text: string;
  onOpen: () => void;
}): ReactElement => (
  <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
    {text}{' '}
    <button type="button" className="underline" onClick={onOpen}>
      Manage blocks in Filters
    </button>
  </Typography>
);
