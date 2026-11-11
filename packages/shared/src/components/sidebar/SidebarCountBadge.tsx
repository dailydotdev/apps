import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import { getUnreadText } from '../notifications/utils';

// The unread count at the end of a v2 panel row. Cabbage, matching the rail
// tab's count bubble: red reads as an error, not an unread count.
export const SidebarCountBadge = ({
  count,
}: {
  count: number;
}): ReactElement => (
  <Typography
    type={TypographyType.Caption1}
    bold
    className="rounded-6 bg-accent-cabbage-default px-1.5 text-white"
  >
    {getUnreadText(count)}
  </Typography>
);
