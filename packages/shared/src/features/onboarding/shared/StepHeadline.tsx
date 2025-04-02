import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

export type StepHeadlineProps = {
  headline: string;
  explainer: string;
  align?: 'left' | 'center';
  visualUrl?: string;
};

const StepHeadline = ({
  headline,
  explainer,
  align = 'center',
}: StepHeadlineProps): ReactElement => {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <Typography bold type={TypographyType.Title1}>
        {headline}
      </Typography>
      <Typography type={TypographyType.Body} color={TypographyColor.Tertiary}>
        {explainer}
      </Typography>
    </div>
  );
};
export default StepHeadline;
