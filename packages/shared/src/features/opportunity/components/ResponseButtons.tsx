import React from 'react';
import type { ReactElement } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon, VIcon } from '../../../components/icons';
import { opportunityUrl } from '../../../lib/constants';
import Link from '../../../components/utilities/Link';
import { opportunityMatchOptions } from '../queries';
import { OpportunityMatchStatus } from '../types';

export const ResponseButtons = ({
  id,
  className,
  size = ButtonSize.Small,
}: {
  id: string;
  className: { container?: string; buttons?: string };
  size?: ButtonSize;
}): ReactElement => {
  const { data } = useQuery(opportunityMatchOptions({ id }));
  const status = data?.status;

  return (
    <div className={className?.container}>
      {(status === OpportunityMatchStatus.Pending ||
        status === OpportunityMatchStatus.CandidateRejected) && (
        <Link href={`${opportunityUrl}/${id}/decline`} passHref>
          <Button
            tag="a"
            className={className?.buttons}
            size={size}
            icon={<MiniCloseIcon />}
            variant={ButtonVariant.Subtle}
            disabled={status === OpportunityMatchStatus.CandidateRejected}
          >
            Not for me
          </Button>
        </Link>
      )}
      {(status === OpportunityMatchStatus.Pending ||
        status === OpportunityMatchStatus.CandidateAccepted) && (
        <Link href={`${opportunityUrl}/${id}/questions`} passHref>
          <Button
            tag="a"
            className={className?.buttons}
            size={size}
            icon={<VIcon />}
            variant={ButtonVariant.Primary}
            disabled={status === OpportunityMatchStatus.CandidateAccepted}
          >
            I&apos;m interested
          </Button>
        </Link>
      )}
    </div>
  );
};
