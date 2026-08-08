import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Deal } from '../types';
import { getDealRedemptionNote } from '../dealsFormat';

interface DealRedemptionNoteProps {
  deal: Deal;
  className?: string;
}

export const DealRedemptionNote = ({
  deal,
  className,
}: DealRedemptionNoteProps): ReactElement => (
  <Typography
    tag={TypographyTag.P}
    type={TypographyType.Caption1}
    color={TypographyColor.Tertiary}
    className={className}
  >
    {getDealRedemptionNote(deal)}
  </Typography>
);
