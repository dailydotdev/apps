import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { creatorsTermsOfService } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export type AwardFeesNoteProps = {
  className?: string;
};

export const AwardFeesNote = ({
  className,
}: AwardFeesNoteProps): ReactElement => {
  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Quaternary}
      className={classNames('text-center', className)}
    >
      Awards may include a revenue share with the recipient and are subject to
      our{' '}
      <a
        href={creatorsTermsOfService}
        target="_blank"
        rel={anchorDefaultRel}
        className="font-bold underline"
      >
        Terms of Service
      </a>
      .
    </Typography>
  );
};
