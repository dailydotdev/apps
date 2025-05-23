import React from 'react';
import type { ReactElement } from 'react';

import { settingsUrl } from '../../../lib/constants';
import type { Organization } from '../types';
import Link from '../../../components/utilities/Link';
import { Button, ButtonSize } from '../../../components/buttons/Button';
import { ArrowIcon } from '../../../components/icons';
import { Image, ImageType } from '../../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

export const OrganizationSiderbarHeader = ({
  organization,
}: {
  organization: Organization;
}): ReactElement => {
  return (
    <div className="relative flex h-10 items-center gap-2">
      <Link href={`${settingsUrl}/organization`} passHref>
        <Button
          tag="a"
          size={ButtonSize.XSmall}
          icon={<ArrowIcon className="-rotate-90" />}
        />
      </Link>
      <Image
        className="size-8 rounded-full object-cover"
        src={organization.image}
        alt={`Avatar of ${organization.name}`}
        type={ImageType.Organization}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Primary}
            bold
            truncate
            className="min-w-0"
          >
            {organization.name}
          </Typography>
        </div>
      </div>
    </div>
  );
};
