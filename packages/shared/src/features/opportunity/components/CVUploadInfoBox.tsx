import type { ReactElement } from 'react';
import React from 'react';
import { ShieldPlusIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

export const CVUploadInfoBox = (): ReactElement => (
  <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
    <div className="flex gap-2">
      <ShieldPlusIcon secondary className="text-status-success" />
      <Typography type={TypographyType.Subhead} bold>
        Why we ask for your CV
      </Typography>
    </div>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      Because guessing is a waste of everyone&apos;s time. The more signal we
      have from day one, the less noise you&apos;ll ever see here. We&apos;d
      rather show you nothing than risk wasting your time, and that starts with
      knowing exactly what&apos;s worth showing you.
      <br />
      <br />
      Your CV stays 100% confidential and no recruiter sees it unless you
      explicitly say yes to an job match.
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      center
      className="mt-2"
    >
      🛡️ One upload. 100% confidential. Zero bad recruiting.
    </Typography>
  </div>
);
