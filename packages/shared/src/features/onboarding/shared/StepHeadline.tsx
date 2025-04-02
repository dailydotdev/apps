import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FunnelStepType } from '../types/funnel';

export type StepHeadlineProps = {
  headline: string;
  explainer: string;
  align?: 'left' | 'center';
  visualUrl?: string;
  type?: FunnelStepType;
};

const StepHeadline = ({
  headline,
  explainer,
  type,
  align = 'center',
}: StepHeadlineProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex flex-col gap-2',
        align === 'center' ? 'text-center' : 'text-left',
      )}
    >
      <Typography bold type={TypographyType.Title1}>
        {headline}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={
          type === FunnelStepType.Quiz
            ? TypographyColor.Tertiary
            : TypographyColor.Primary
        }
      >
        {explainer}
      </Typography>
    </div>
  );
};
export default StepHeadline;
