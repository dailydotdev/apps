import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { CreditCardIcon, ExitIcon, PlusIcon, SettingsIcon } from '../../icons';
import HeaderLogo from '../../layout/HeaderLogo';
import { SidebarScrollWrapper } from '../../sidebar/common';
import { useOpportunities } from '../../../features/opportunity/hooks/useOpportunities';
import type { Opportunity } from '../../../features/opportunity/types';
import { OpportunityState } from '../../../features/opportunity/protobuf/opportunity';
import { settingsUrl, webappUrl } from '../../../lib/constants';
import { getPathnameWithQuery } from '../../../lib/links';
import { LogoutReason } from '../../../lib/user';
import InfiniteScrolling, {
  checkFetchMore,
} from '../../containers/InfiniteScrolling';
import { Loader } from '../../Loader';

const Header = () => (
  <div className="p-4">
    <HeaderLogo isRecruiter href="/recruiter" />
  </div>
);

type CompanyBadgeProps = {
  name: string;
  image?: string | null;
  editUrl?: string;
};

export const CompanyBadge = ({ name, image, editUrl }: CompanyBadgeProps) => (
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
    {editUrl && (
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<SettingsIcon />}
        size={ButtonSize.XSmall}
        href={editUrl}
        tag="a"
      />
    )}
  </div>
);

const Footer = () => {
  const { user, logout } = useAuthContext();
  return (
    <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary p-3">
      <ProfilePicture user={user} size={ProfileImageSize.Medium} />
      <div className="flex-1 overflow-hidden">
        <Typography type={TypographyType.Subhead} bold className="truncate">
          {user?.name || 'Guest user'}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="truncate"
        >
          {user?.username || '@guestuser'}
        </Typography>
      </div>
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<CreditCardIcon />}
        size={ButtonSize.XSmall}
        href={`${webappUrl}recruiter/billing`}
        tag="a"
      />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<SettingsIcon />}
        size={ButtonSize.XSmall}
        href={getPathnameWithQuery(
          `${settingsUrl}/profile`,
          new URLSearchParams({
            redirectTo: `${webappUrl}recruiter`,
            redirectCopy: 'Back to recruiter dashboard',
          }),
        )}
        tag="a"
      />
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<ExitIcon />}
        size={ButtonSize.XSmall}
        onClick={() => logout(LogoutReason.ManualLogout)}
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
  orgId: string;
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
      {opportunities.map((opportunity) => {
        const isDraft = opportunity.state === OpportunityState.DRAFT;
        const path = isDraft ? 'edit' : 'matches';
        return (
          <Button
            key={opportunity.id}
            tag="a"
            href={`${webappUrl}recruiter/${opportunity.id}/${path}`}
            variant={ButtonVariant.Option}
            className="w-full"
            size={ButtonSize.Small}
          >
            {opportunity.title}
          </Button>
        );
      })}
    </div>
  );
};

const SidebarSection = ({
  orgId,
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
      <CompanyBadge
        name={orgName}
        image={orgImage}
        editUrl={
          orgId !== 'no-org'
            ? `${webappUrl}recruiter/organizations/${orgId}`
            : undefined
        }
      />
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

const STATE_KEYS: Record<OpportunityState, keyof StateGroup | null> = {
  [OpportunityState.DRAFT]: 'draft',
  [OpportunityState.IN_REVIEW]: 'active',
  [OpportunityState.LIVE]: 'active',
  [OpportunityState.CLOSED]: 'paused',
  [OpportunityState.PARSING]: 'draft',
  [OpportunityState.ERROR]: 'draft',
  [OpportunityState.UNSPECIFIED]: null,
};

export const Sidebar = (): ReactElement => {
  // Fetch all opportunities with infinite scroll
  const opportunitiesQuery = useOpportunities();
  const { allOpportunities, isLoading } = opportunitiesQuery;

  // Group opportunities by organization and state
  const opportunitiesByOrg = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        name: string;
        image?: string | null;
        opportunitiesByState: StateGroup;
      }
    >();

    allOpportunities.forEach((opportunity) => {
      const orgId = opportunity.organization?.id || 'no-org';
      const orgName = opportunity.organization?.name || 'No Organization';
      const orgImage = opportunity.organization?.image;

      if (!grouped.has(orgId)) {
        grouped.set(orgId, {
          id: orgId,
          name: orgName,
          image: orgImage,
          opportunitiesByState: {
            draft: [],
            active: [],
            paused: [],
          },
        });
      }

      const orgGroup = grouped.get(orgId);
      if (orgGroup) {
        // Categorize by state
        const key = STATE_KEYS[opportunity.state];
        if (key) {
          orgGroup.opportunitiesByState[key].push(opportunity);
        }
      }
    });

    return grouped;
  }, [allOpportunities]);

  const canFetchMore = checkFetchMore(opportunitiesQuery);

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-border-subtlest-tertiary">
      <SidebarScrollWrapper className="min-h-0 flex-1">
        <Header />
        <InfiniteScrolling
          canFetchMore={canFetchMore}
          fetchNextPage={opportunitiesQuery.fetchNextPage}
          isFetchingNextPage={opportunitiesQuery.isFetchingNextPage}
          placeholder={<Loader />}
        >
          <nav className="flex flex-col gap-2 pb-2">
            <div className="px-2">
              <Button
                tag="a"
                href={`${webappUrl}recruiter?openModal=joblink&closeable=1`}
                variant={ButtonVariant.Option}
                className="w-full px-2"
                size={ButtonSize.Small}
              >
                <PlusIcon /> New job
              </Button>
            </div>
            {isLoading && <Loader />}
            {Array.from(opportunitiesByOrg.values()).map((org) => (
              <SidebarSection
                key={org.id}
                orgId={org.id}
                orgName={org.name}
                orgImage={org.image}
                opportunitiesByState={org.opportunitiesByState}
              />
            ))}
          </nav>
        </InfiniteScrolling>
      </SidebarScrollWrapper>
      <Footer />
    </aside>
  );
};
