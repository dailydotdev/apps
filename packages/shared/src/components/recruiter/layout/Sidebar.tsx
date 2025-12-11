import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ExitIcon, PlusIcon, SettingsIcon } from '../../icons';
import HeaderLogo from '../../layout/HeaderLogo';
import { SidebarScrollWrapper } from '../../sidebar/common';
import { Tips } from '../Tips';
import { getOpportunitiesOptions } from '../../../features/opportunity/queries';
import type { Opportunity } from '../../../features/opportunity/types';
import { OpportunityState } from '../../../features/opportunity/protobuf/opportunity';
import { webappUrl } from '../../../lib/constants';

const Header = () => (
  <div className="p-4">
    <HeaderLogo isRecruiter />
  </div>
);

type CompanyBadgeProps = {
  name: string;
  image?: string | null;
};

export const CompanyBadge = ({ name, image }: CompanyBadgeProps) => (
  <div className="flex items-center gap-2 px-3 py-2">
    <ProfilePicture
      user={{ image }}
      rounded="full"
      size={ProfileImageSize.Medium}
    />
    <div className="flex-1 overflow-hidden">
      <Typography type={TypographyType.Subhead} bold className="truncate">
        {name}
      </Typography>
    </div>
  </div>
);

const Footer = () => {
  const { user } = useAuthContext();
  return (
    <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary p-3">
      <ProfilePicture user={{ image: null }} size={ProfileImageSize.Medium} />
      <div>
        <Typography type={TypographyType.Subhead} bold>
          {user?.name || 'Guest user'}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {user?.username || '@guestuser'}
        </Typography>
      </div>
      <div className="flex-1" />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<SettingsIcon />}
        size={ButtonSize.XSmall}
      />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<ExitIcon />}
        size={ButtonSize.XSmall}
      />
    </div>
  );
};

type StateGroup = {
  draft: Opportunity[];
  active: Opportunity[];
  paused: Opportunity[];
};

type SidebarSectionProps = {
  orgName: string;
  orgImage?: string | null;
  opportunitiesByState: StateGroup;
};

const getStateName = (state: keyof StateGroup): string => {
  const stateNames = {
    draft: 'Draft',
    active: 'Active',
    paused: 'Paused',
  };
  return stateNames[state];
};

const StateSubsection = ({
  stateName,
  opportunities,
}: {
  stateName: string;
  opportunities: Opportunity[];
}) => {
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="px-2">
      <Typography
        type={TypographyType.Footnote}
        bold
        color={TypographyColor.Quaternary}
        className="px-4 py-1"
      >
        {stateName}
      </Typography>
      {opportunities.map((opportunity) => (
        <Button
          key={opportunity.id}
          tag="a"
          href={`${webappUrl}recruiter/${opportunity.id}/analyze`}
          variant={ButtonVariant.Option}
          className="w-full"
          size={ButtonSize.Small}
        >
          {opportunity.title}
        </Button>
      ))}
    </div>
  );
};

const SidebarSection = ({
  orgName,
  orgImage,
  opportunitiesByState,
}: SidebarSectionProps) => {
  const totalOpportunities =
    opportunitiesByState.draft.length +
    opportunitiesByState.active.length +
    opportunitiesByState.paused.length;

  if (totalOpportunities === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <CompanyBadge name={orgName} image={orgImage} />
      {(['draft', 'active', 'paused'] as const).map((state) => (
        <StateSubsection
          key={state}
          stateName={getStateName(state)}
          opportunities={opportunitiesByState[state]}
        />
      ))}
    </div>
  );
};

export const Sidebar = (): ReactElement => {
  // Fetch all opportunities
  const { data: opportunitiesData } = useQuery(getOpportunitiesOptions());

  // Group opportunities by organization and state
  const opportunitiesByOrg = useMemo(() => {
    const opportunities =
      opportunitiesData?.edges.map((edge) => edge.node) || [];
    const grouped = new Map<
      string,
      {
        name: string;
        image?: string | null;
        opportunitiesByState: StateGroup;
      }
    >();

    opportunities.forEach((opportunity) => {
      const orgName = opportunity.organization?.name || 'No Organization';
      const orgImage = opportunity.organization?.image;

      if (!grouped.has(orgName)) {
        grouped.set(orgName, {
          name: orgName,
          image: orgImage,
          opportunitiesByState: {
            draft: [],
            active: [],
            paused: [],
          },
        });
      }

      const orgGroup = grouped ? grouped.get(orgName) : 'No name';

      // Categorize by state
      if (opportunity.state === OpportunityState.DRAFT) {
        orgGroup.opportunitiesByState.draft.push(opportunity);
      } else if (opportunity.state === OpportunityState.LIVE) {
        orgGroup.opportunitiesByState.active.push(opportunity);
      } else if (opportunity.state === OpportunityState.CLOSED) {
        orgGroup.opportunitiesByState.paused.push(opportunity);
      }
    });

    return grouped;
  }, [opportunitiesData]);

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-border-subtlest-tertiary">
      <SidebarScrollWrapper>
        <Header />
        <nav className="flex flex-col gap-2">
          <div className="px-2">
            <Button
              tag="a"
              href={`${webappUrl}recruiter`}
              variant={ButtonVariant.Option}
              className="w-full px-2"
              size={ButtonSize.Small}
            >
              <PlusIcon /> New job
            </Button>
          </div>
          {Array.from(opportunitiesByOrg.values()).map((org) => (
            <SidebarSection
              key={org.name}
              orgName={org.name}
              orgImage={org.image}
              opportunitiesByState={org.opportunitiesByState}
            />
          ))}
        </nav>
        <div className="flex-1" />
        <Tips />
        <Footer />
      </SidebarScrollWrapper>
    </aside>
  );
};
