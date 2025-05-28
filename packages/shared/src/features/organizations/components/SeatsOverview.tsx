import React from 'react';
import type { ReactElement } from 'react';
import {
  DevPlusIcon,
  InfoIcon,
  PlusUserIcon,
  SquadIcon,
} from '../../../components/icons';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { SimpleTooltip } from '../../../components/tooltips';
import { useOrganization } from '../hooks/useOrganization';

export const SeatsOverview = ({
  organizationId,
}: {
  organizationId: string;
}): ReactElement => {
  const { seats } = useOrganization(organizationId);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SquadIcon secondary />
        <Typography type={TypographyType.Footnote}>Total seats:</Typography>
        <Typography bold type={TypographyType.Footnote}>
          {seats.total}
        </Typography>

        <SimpleTooltip content="The total number of seats in your organization.">
          <div>
            <InfoIcon />
          </div>
        </SimpleTooltip>
      </div>
      <div className="flex items-center gap-2">
        <PlusUserIcon />
        <Typography type={TypographyType.Footnote}>Assigned seats:</Typography>
        <Typography bold type={TypographyType.Footnote}>
          {seats.assigned}
        </Typography>

        <SimpleTooltip content="TODO: Implement assigned seats">
          <div>
            <InfoIcon />
          </div>
        </SimpleTooltip>
      </div>
      <div className="flex items-center gap-2">
        <DevPlusIcon secondary />
        <Typography type={TypographyType.Footnote}>Available seats:</Typography>
        <Typography bold type={TypographyType.Footnote}>
          {seats.available}
        </Typography>

        <SimpleTooltip content="TODO: Implement available seats">
          <div>
            <InfoIcon />
          </div>
        </SimpleTooltip>
      </div>
    </section>
  );
};
