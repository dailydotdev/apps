import React, { ReactElement } from 'react';
import { PublicProfile } from '../lib/user';
import { SimpleTooltip } from './tooltips';
import { ProfileImageSize, ProfilePicture } from './ProfilePicture';
import { useUserCompaniesQuery } from '../hooks/userCompany';

export type VerifiedCompanyUserBadgeProps = {
  user: Pick<PublicProfile, 'companies'>;
};

export const VerifiedCompanyUserBadge = ({
  user,
}: VerifiedCompanyUserBadgeProps): ReactElement => {
  const { isVerified } = useUserCompaniesQuery();
  const { companies } = user;

  return (
    <SimpleTooltip
      content={[
        `Verified as a ${companies[0].name} employee.`,
        ...(isVerified
          ? []
          : [<br />, 'Get your company badge via account settings.']),
      ]}
      placement="bottom"
      container={{
        className: 'text-center',
      }}
    >
      <div className="ml-1 flex items-center">
        <ProfilePicture
          size={ProfileImageSize.Size16}
          user={{
            image: companies[0].image,
            id: companies[0].name,
          }}
          rounded="full"
        />
      </div>
    </SimpleTooltip>
  );
};
