import type { ReactElement } from 'react';
import React from 'react';
import { Typography, TypographyType } from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { FilterIcon } from '../icons';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { ShellPage } from '../shell/ShellPageContext';
import { useAuthContext } from '../../contexts/AuthContext';

const jobPreferenceUrl = `${settingsUrl}/job-preferences`;
const howItWorksUrl = `${webappUrl}jobs/how-it-works`;
export const OpportunityHeader = (): ReactElement => {
  const isPhone = useViewSize(ViewSize.MobileL);
  const { user } = useAuthContext();
  const actions = (
    <div className="flex gap-2">
      <Link href={howItWorksUrl} passHref>
        <Button tag="a" variant={ButtonVariant.Subtle} size={ButtonSize.Small}>
          How it works
        </Button>
      </Link>
      {user && (
        <Link href={jobPreferenceUrl} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            icon={<FilterIcon />}
            aria-label="Job preferences"
          />
        </Link>
      )}
    </div>
  );

  // On a phone the title and its actions are the block's.
  if (isPhone) {
    return <ShellPage title="Jobs" actions={actions} />;
  }

  return (
    <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-5 py-3">
      <Typography type={TypographyType.Title3} bold>
        Jobs
      </Typography>
      {actions}
    </div>
  );
};
