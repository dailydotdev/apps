import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import { ButtonV2, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import Link from '../utilities/Link';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { FilterIcon } from '../icons';

const jobPreferenceUrl = `${settingsUrl}/job-preferences`;
const howItWorksUrl = `${webappUrl}jobs/how-it-works`;
export const OpportunityHeader = (): ReactElement => {
  return (
    <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-5 py-3">
      <Typography type={TypographyType.Title3} bold>
        Jobs
      </Typography>
      <div className="flex gap-2">
        <Link href={howItWorksUrl} passHref>
          <ButtonV2
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
          >
            How it works
          </ButtonV2>
        </Link>
        <Link href={jobPreferenceUrl} passHref>
          <ButtonV2
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<FilterIcon />}
          />
        </Link>
      </div>
    </div>
  );
};
