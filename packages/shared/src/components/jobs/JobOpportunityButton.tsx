import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { JobIcon } from '../icons';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { briefButtonBg } from '../../styles/custom';
import { Tooltip } from '../tooltip/Tooltip';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';

type JobOpportunityButtonProps = {
  className?: string;
};

export const JobOpportunityButton = ({
  className,
}: JobOpportunityButtonProps): ReactElement => {
  return (
    <Tooltip
      content="A personalized job opportunity was matched to your profile. Click to review it privately"
      className="!max-w-80 text-center"
    >
      <Link href={`${webappUrl}jobs/welcome`} passHref>
        <Button
          icon={<JobIcon />}
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          style={{
            background: briefButtonBg,
          }}
          tag="a"
          className={classNames(className, 'text-black')}
        >
          One opportunity is waiting for you here
        </Button>
      </Link>
    </Tooltip>
  );
};
