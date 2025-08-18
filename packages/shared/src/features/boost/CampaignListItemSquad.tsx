import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { iconSizeToClassName, IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../components/typography/Typography';
import type { Squad } from '../../graphql/sources';
import { Image } from '../../components/image/Image';

interface CampaignListItemSquadProps {
  squad: Squad;
}

export function CampaignListItemSquad({
  squad,
}: CampaignListItemSquadProps): ReactElement {
  return (
    <span className="flex flex-1 flex-row items-center gap-2">
      {squad.image && (
        <Image
          src={squad.image}
          className={classNames(
            'rounded-max object-cover',
            iconSizeToClassName[IconSize.Size48],
          )}
        />
      )}
      <div className="flex flex-col">
        <span className="flex flex-1">
          <Typography
            type={TypographyType.Callout}
            className="line-clamp-1 flex-1 text-left"
            style={{ lineBreak: 'anywhere' }}
          >
            {squad.name}
          </Typography>
        </span>
        <span className="flex flex-1">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="line-clamp-1 flex-1 text-left"
            style={{ lineBreak: 'anywhere' }}
          >
            {squad.name}
          </Typography>
        </span>
      </div>
    </span>
  );
}
