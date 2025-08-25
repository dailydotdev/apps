import type { ReactElement } from 'react';
import React from 'react';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Button } from '../../components/buttons/Button';
import { ButtonVariant } from '../../components/buttons/common';
import { OpenLinkIcon } from '../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { CampaignListViewContainer } from './common';
import { Image } from '../../components/image/Image';
import type { Squad } from '../../graphql/sources';

interface CampaignListViewPostProps {
  squad: Squad;
}

export function CampaignListViewSquad({
  squad,
}: CampaignListViewPostProps): ReactElement {
  return (
    <CampaignListViewContainer>
      <div className="flex flex-col items-center">
        <span className="flex flex-1 flex-row">
          <Typography
            type={TypographyType.Callout}
            className="line-clamp-1 flex-1"
            style={{ lineBreak: 'anywhere' }}
          >
            {squad.name}
          </Typography>
        </span>
        <span className="flex flex-1 flex-row">
          <Typography
            type={TypographyType.Subhead}
            className="line-clamp-1 flex-1"
            style={{ lineBreak: 'anywhere' }}
            color={TypographyColor.Tertiary}
          >
            Squad <Separator /> @{squad.handle}
          </Typography>
        </span>
      </div>
      <Image
        src={squad.image}
        className="ml-auto h-12 w-12 rounded-max object-cover"
      />
      <Button
        icon={<OpenLinkIcon />}
        variant={ButtonVariant.Tertiary}
        tag="a"
        href={squad.permalink}
      />
    </CampaignListViewContainer>
  );
}
