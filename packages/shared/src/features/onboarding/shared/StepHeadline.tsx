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
  description?: string;
  descriptionProps?: TypographyProps<TypographyTag.P>;
  heading: string;
};

const StepHeadline = ({
  align = StepHeadlineAlign.Center,
  description,
  descriptionProps,
  heading,
}: StepHeadlineProps): ReactElement => {
  return (
    <div
      data-testid="step-headline-container"
      className={classNames('flex flex-col gap-2', `text-${align}`)}
    >
      <Typography bold tag={TypographyTag.H2} type={TypographyType.Title1}>
        {heading}
      </Typography>
      {!!description?.length && (
        <Typography
          data-testid="step-headline-description"
          type={TypographyType.Body}
          {...descriptionProps}
        >
          {description}
        </Typography>
      )}
    </div>
  );
};
export default StepHeadline;
