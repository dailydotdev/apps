import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../lib/user';
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

  if (!companies || companies.length === 0) {
    return null;
  }

  return (
    <SimpleTooltip
      content={[
        `Verified as a ${companies[0].name} employee.`,
        ...(isVerified
          ? []
          : // eslint-disable-next-line react/jsx-key
            [<br />, 'Get your company badge via account settings.']),
      ]}
      placement="bottom"
      container={{
        className: 'text-center',
      }}
    >
      <div className="ml-1 flex items-center">
        <ProfilePicture
          size={ProfileImageSize.Size16}
          className="border border-border-subtlest-secondary"
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
