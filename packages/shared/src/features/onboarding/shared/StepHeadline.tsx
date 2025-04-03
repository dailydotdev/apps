import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyTag,
} from '../../../components/typography/Typography';
import type { TypographyProps } from '../../../components/typography/Typography';

export enum StepHeadlineAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export type StepHeadlineProps = {
  align?: StepHeadlineAlign;
  explainer?: string;
  explainerProps?: TypographyProps<TypographyTag.P>;
  headline: string;
};

const StepHeadline = ({
  align = StepHeadlineAlign.Center,
  explainer,
  explainerProps,
  headline,
}: StepHeadlineProps): ReactElement => {
  return (
    <div
      data-testid="step-headline-container"
      className={classNames('flex flex-col gap-2', `text-${align}`)}
    >
      <Typography bold tag={TypographyTag.H2} type={TypographyType.Title1}>
        {headline}
      </Typography>
      {!!explainer?.length && (
        <Typography
          data-testid="step-headline-explainer"
          type={TypographyType.Body}
          {...explainerProps}
        >
          {explainer}
        </Typography>
      )}
    </div>
  );
};
export default StepHeadline;
