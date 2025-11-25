import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import {
  JobIcon,
  MedalBadgeIcon,
  ShieldPlusIcon,
} from '../../../components/icons';

const benefits = [
  {
    icon: <ShieldPlusIcon secondary />,
    title: 'No recruiter spam',
    description:
      'No cold DMs from strangers. Only real roles from vetted teams, surfaced when there is a strong reason to talk.',
  },
  {
    icon: <MedalBadgeIcon />,
    title: 'Private until you say yes',
    description:
      'You stay invisible until you choose to engage. You quietly review matches, and nothing moves without your clear approval.',
  },
  {
    icon: <JobIcon secondary />,
    title: 'Signal, not noise',
    description:
      'We match you with roles based on your skills, preferences, and goals. If it is not a real fit, you will not see it.',
  },
];
export const OpportunityBenefits = (): ReactElement => {
  return (
    <div className="flex flex-col gap-4 text-center tablet:flex-row">
      {benefits.map(({ icon, title, description }) => (
        <FlexCol className="flex-1 items-center gap-1" key={title}>
          {icon}
          <Typography type={TypographyType.Callout} bold className="mt-1.5">
            {title}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {description}
          </Typography>
        </FlexCol>
      ))}
    </div>
  );
};
