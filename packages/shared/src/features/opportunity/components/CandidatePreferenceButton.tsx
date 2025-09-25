import React from 'react';
import type { ReactElement } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { IconSize } from '../../../components/Icon';
import { JobIcon } from '../../../components/icons';
import Link from '../../../components/utilities/Link';
import { useLogContext } from '../../../contexts/LogContext';
import { settingsUrl } from '../../../lib/constants';
import type { TargetId } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { anchorDefaultRel } from '../../../lib/strings';
import type { WithClassNameProps } from '../../../components/utilities';

export const CandidatePreferenceButton = ({
  label = 'Job preferences',
  targetId,
  className,
}: {
  label?: string;
  targetId: TargetId;
} & WithClassNameProps): ReactElement => {
  const { logEvent } = useLogContext();
  return (
    <Link href={`${settingsUrl}/job-preferences`} passHref>
      <Button
        tag="a"
        size={ButtonSize.Large}
        variant={ButtonVariant.Subtle}
        icon={<JobIcon size={IconSize.Small} />}
        className={className}
        rel={anchorDefaultRel}
        onClick={() => {
          logEvent({
            event_name: LogEvent.ClickCandidatePreferences,
            target_id: targetId,
          });
        }}
      >
        {label}
      </Button>
    </Link>
  );
};
