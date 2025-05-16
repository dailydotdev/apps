import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../../../components/typography/Typography';
import type { TypographyProps } from '../../../components/typography/Typography';
import { sanitizeMessage } from './utils';
import type { WithClassNameProps } from '../../../components/utilities';

export enum StepHeadlineAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface StepHeadlineProps extends WithClassNameProps {
  align?: StepHeadlineAlign;
  description?: string;
  descriptionProps?: TypographyProps<TypographyTag.P>;
  heading: string;
}

export const StepHeadline = ({
  align = StepHeadlineAlign.Center,
  description,
  descriptionProps,
  heading,
  className,
}: StepHeadlineProps): ReactElement => {
  const titleHtml = useMemo(() => sanitizeMessage(heading), [heading]);
  const descHtml = useMemo(() => sanitizeMessage(description), [description]);

  return (
    <div
      data-testid="step-headline-container"
      className={classNames('flex flex-col gap-2', className, {
        'text-left': align === StepHeadlineAlign.Left,
        'text-center': align === StepHeadlineAlign.Center,
        'text-right': align === StepHeadlineAlign.Right,
      })}
    >
      <Typography
        bold
        color={TypographyColor.Primary}
        tag={TypographyTag.H2}
        type={TypographyType.Title1}
        dangerouslySetInnerHTML={{ __html: titleHtml }}
      />
      {!!descHtml?.length && (
        <Typography
          data-testid="step-headline-description"
          color={TypographyColor.Primary}
          type={TypographyType.Body}
          dangerouslySetInnerHTML={{ __html: descHtml }}
          {...descriptionProps}
        />
      )}
    </div>
  );
};
export default StepHeadline;
