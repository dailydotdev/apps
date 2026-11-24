import type { ReactElement } from 'react';
import React from 'react';
import { Loader } from '../../../../components/Loader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  CheckoutShell,
  CheckoutStage,
  CheckoutTitle,
} from '../checkout/CheckoutShell';
import { StartupsNameStunt } from '../checkout/StartupsNameStunt';
import { getWebsiteName } from './CompanyPageWebsiteStep';

interface CompanyPageBuildingProps {
  website: string;
}

/** Signed up before we finished reading the site: wait here for the page. */
export const CompanyPageBuilding = ({
  website,
}: CompanyPageBuildingProps): ReactElement => {
  const host = website.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <CheckoutShell
      current={CheckoutStage.Setup}
      aside={<StartupsNameStunt name={getWebsiteName(website)} />}
    >
      <CheckoutTitle
        title="Building your company page"
        description={`Reading ${host}. This usually takes less than a minute.`}
      />
      <div className="flex items-center gap-3" role="status">
        <Loader />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Pulling your logo and description
        </Typography>
      </div>
    </CheckoutShell>
  );
};
