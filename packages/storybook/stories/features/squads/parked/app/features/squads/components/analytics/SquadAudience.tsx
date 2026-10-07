import type { ReactElement } from 'react';
import React from 'react';
import type { SquadAudience as SquadAudienceData } from '../../../../graphql/squadWelcomeAudience';
import {
  SQUAD_AUDIENCE_MIN_COMPANY,
  SQUAD_AUDIENCE_MIN_MEMBERS,
} from '../../../../graphql/squadWelcomeAudience';
import { DataTile } from '@dailydotdev/shared/src/components/DataTile';
import { UserIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { getRecruiterExperienceLevelLabel } from '@dailydotdev/shared/src/lib/user';
import { SquadAudienceBreakdown } from './SquadAudienceBreakdown';

const memberIcon = (
  <UserIcon size={IconSize.Small} className="text-text-tertiary" />
);

/**
 * Who a verified squad's members are, for Manage › Analytics. Aggregates
 * only, held back below the minimum audience.
 */
export const SquadAudience = ({
  audience,
}: {
  audience: SquadAudienceData;
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
      <DataTile
        label="Members"
        value={audience.members}
        info="Everyone in the squad today"
        icon={memberIcon}
      />
      <DataTile
        label="New members"
        value={audience.newMembers}
        info="People who joined in the last 30 days"
        icon={memberIcon}
      />
    </div>
    {audience.isEnough ? (
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
        <SquadAudienceBreakdown
          title="Seniority"
          rows={audience.seniority.map((row) => ({
            ...row,
            label: getRecruiterExperienceLevelLabel(row.label) ?? row.label,
          }))}
          empty="Not enough members have set their experience yet."
        />
        <SquadAudienceBreakdown
          title="Their stack"
          rows={audience.stack}
          empty="Not enough members list a stack on their profile yet."
        />
        <SquadAudienceBreakdown
          title="Companies they work at"
          rows={audience.companies}
          empty={`A company shows once ${SQUAD_AUDIENCE_MIN_COMPANY} of its people are members.`}
        />
      </div>
    ) : (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {`Seniority, stack and companies show once the squad has ${SQUAD_AUDIENCE_MIN_MEMBERS} members.`}
      </Typography>
    )}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
    >
      {`Shares of all members, from their daily.dev profiles. Never names: a company shows only once ${SQUAD_AUDIENCE_MIN_COMPANY} or more of its people are members.`}
    </Typography>
  </div>
);
