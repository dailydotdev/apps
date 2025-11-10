import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import {
  ActivelyLookingIcon,
  PassiveIcon,
  SemiActiveIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { CandidateStatus } from '../protobuf/user-candidate-preference';
import { ProgressStep } from './ProgressStep';

const options = [
  {
    value: CandidateStatus.ACTIVELY_LOOKING,
    icon: <ActivelyLookingIcon size={IconSize.XLarge} />,
    title: 'Active looking',
    description:
      "I'm in the market and ready to move. This one just wasn't a fit.",
  },
  {
    value: CandidateStatus.OPEN_TO_OFFERS,
    icon: <SemiActiveIcon size={IconSize.XLarge} />,
    title: "Open only if it's right",
    description:
      "I'm happy where I am, but I'd explore something truly exceptional.",
  },
  {
    value: CandidateStatus.DISABLED,
    icon: <PassiveIcon size={IconSize.XLarge} />,
    title: 'Not looking right now',
    description:
      "I'm not open to job matches right now. Step back until I say otherwise.",
  },
];

export const CandidateStatusStep = ({
  selectedStatus,
  onStatusSelect,
  currentStep,
  totalSteps,
  skipButton,
}: {
  selectedStatus: CandidateStatus | null;
  onStatusSelect: (status: CandidateStatus) => void;
  currentStep: number;
  totalSteps: number;
  skipButton?: React.ReactNode;
}): ReactElement => {
  return (
    <>
      <FlexCol className="gap-4">
        <Typography type={TypographyType.LargeTitle} bold center>
          Help us respect your time
        </Typography>
        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Secondary}
          center
        >
          We only reach out when it&apos;s worth it. Tell us where you stand so
          we can match you with the right job matches, or step back entirely
          until you&apos;re ready.
        </Typography>
      </FlexCol>
      <FlexCol className="rounded-16 border-border-subtlest-tertiary gap-3 border p-4">
        <ProgressStep currentStep={currentStep} totalSteps={totalSteps} />
        <FlexCol className="gap-2">
          {options.map(({ value, icon, title, description }) => (
            <Button
              key={value}
              variant={ButtonVariant.Option}
              className={classNames(
                'border-border-subtlest-tertiary !h-auto w-auto gap-3 border !p-3',
                {
                  'bg-surface-float': selectedStatus === value,
                },
              )}
              onClick={() => onStatusSelect(value)}
            >
              <div className="rounded-10 relative top-0.5 flex size-12 items-center justify-center">
                {icon}
              </div>
              <FlexCol className="flex-1 text-left">
                <Typography
                  color={TypographyColor.Primary}
                  type={TypographyType.Body}
                  bold
                >
                  {title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {description}
                </Typography>
              </FlexCol>
            </Button>
          ))}
        </FlexCol>
        {skipButton}
      </FlexCol>
    </>
  );
};
