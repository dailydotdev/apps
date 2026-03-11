import type { ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface NotificationSectionHeadingProps {
  children: ReactNode;
}

const NotificationSectionHeading = ({
  children,
}: NotificationSectionHeadingProps) => (
  <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
    {children}
  </Typography>
);

export default NotificationSectionHeading;
