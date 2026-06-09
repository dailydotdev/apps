import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';
import { GivebackSection } from './GivebackSection';

// Lemonade's strongest move: translate donations into tangible human outcomes,
// not just dollars. These are illustrative projections for the goal, mapped to
// the real causes the community can pick. This is the emotional payoff of the
// "Why" tab — kept to a single clean grid, nothing else.
const impactOutcomes: {
  value: string;
  label: string;
  cause: string;
  accent: string;
}[] = [
  {
    value: '3,200 learners',
    label: 'start coding for free',
    cause: 'freeCodeCamp',
    accent: 'text-accent-cabbage-default',
  },
  {
    value: '40 maintainers',
    label: 'funded to keep critical tools alive',
    cause: 'Python Software Foundation',
    accent: 'text-accent-cheese-default',
  },
  {
    value: '15M lbs',
    label: 'of e-waste kept out of landfills',
    cause: 'Human-I-T',
    accent: 'text-accent-avocado-default',
  },
  {
    value: '250 people',
    label: 'keep browsing the web with a screen reader',
    cause: 'NV Access',
    accent: 'text-accent-onion-default',
  },
];

export const CommunityImpactSection = (): ReactElement => {
  const { campaign } = useGivebackContext();

  return (
    <GivebackSection
      id="giveback-impact"
      eyebrow="In real terms"
      title="What your work turns into"
      description={`What the ${formatDonationAmount(
        campaign.goalAmount,
        campaign.currency,
      )} goal pays for once it reaches the causes you pick.`}
    >
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        {impactOutcomes.map(({ value, label, cause, accent }) => (
          <FlexCol
            key={cause}
            className="group gap-2 rounded-16 border border-border-subtlest-tertiary p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2 motion-reduce:transform-none"
          >
            <Typography bold type={TypographyType.Title1} className={accent}>
              {value}
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
            >
              {label}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              bold
              className="mt-1 uppercase tracking-wider"
            >
              {cause}
            </Typography>
          </FlexCol>
        ))}
      </div>
    </GivebackSection>
  );
};
