import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { SourceMemberRole } from '@dailydotdev/shared/src/graphql/sources';
import type { SquadSeatMember } from '@dailydotdev/shared/src/graphql/squadSubscription';
import {
  acme,
  noPlan,
  owner,
  person,
  Seeded,
  team,
} from '../startups-playgrounds/seed';
import { ManageProposed, PlanStatus, UpsellProposed, Viewer } from './manage';
import { UpsellOnPage } from './upsellPage';
import { Providers } from './providers';

const meta: Meta = {
  title: 'Startups Onboarding/2b. Manage and upsell',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const inLayout = (
  props: React.ComponentProps<typeof ManageProposed>,
): ReactElement => (
  <Seeded squad={acme} subscription={noPlan}>
    <SquadManageLayout section={SquadManageSection.Plan}>
      <ManageProposed ownerId={owner.user.id} {...props} />
    </SquadManageLayout>
  </Seeded>
);

const starterTeam = [
  owner,
  ...team.slice(1).map((m) => ({ ...m, seat: false })),
];
const asOtherAdmin = { viewer: Viewer.Admin, ownerId: 'maya' };
const asModerator = { viewer: Viewer.Moderator, ownerId: 'maya' };
const fullTeam: SquadSeatMember[] = [
  owner,
  person('maya', 'Maya Levi', SourceMemberRole.Admin, true),
  person('jonas', 'Jonas Berg', SourceMemberRole.Moderator, true),
  person('priya', 'Priya Nair', SourceMemberRole.Moderator, true),
  person('sam', 'Sam Ortiz', SourceMemberRole.Moderator, true),
  person('lee', 'Lee Park', SourceMemberRole.Moderator, false),
];

const story = (
  name: string,
  props: React.ComponentProps<typeof ManageProposed>,
): Story => ({ name, render: () => inLayout(props) });

export const Loading = story('G0. Plan still loading', { isLoading: true });
export const SeatsLoading = story('G0c. Seats still loading', {
  plan: SquadPlan.Team,
  areSeatsLoading: true,
});
export const LookupFailed = story('G0. Plan lookup failed', { isFailed: true });
export const NoPlanAdmin = story('G1. No plan, admin', {});
export const NoPlanModerator = story('G2. No plan, moderator', {
  viewer: Viewer.Moderator,
});
export const StarterOwner = story('G3. Starter, owner', {
  plan: SquadPlan.Starter,
  members: starterTeam,
});
export const StarterAdmin = story('G3. Starter, another admin', {
  plan: SquadPlan.Starter,
  members: starterTeam,
  ...asOtherAdmin,
});
export const StarterModerator = story('G3. Starter, moderator', {
  plan: SquadPlan.Starter,
  members: starterTeam,
  ...asModerator,
});
export const TeamOwner = story('G4. Team, owner', {
  plan: SquadPlan.Team,
  members: team,
});
export const TeamAdmin = story('G5. Team, another admin', {
  plan: SquadPlan.Team,
  members: team,
  ...asOtherAdmin,
});
export const TeamModerator = story('G6. Team, moderator', {
  plan: SquadPlan.Team,
  members: team,
  ...asModerator,
});
export const TeamFull = story('G7. Team full', {
  plan: SquadPlan.Team,
  members: fullTeam,
});
export const SeatChanging = story('G8. Seat change in progress', {
  plan: SquadPlan.Team,
  members: team,
  pendingId: 'jonas',
});
export const SeatFailed = story('G8. Seat change failed', {
  plan: SquadPlan.Team,
  members: team,
  errorId: 'jonas',
});
export const PastDue = story('G9. Payment failed, owner', {
  plan: SquadPlan.Team,
  members: team,
  status: PlanStatus.PastDue,
});
export const PastDueAdmin = story('G9. Payment failed, another admin', {
  plan: SquadPlan.Team,
  members: team,
  status: PlanStatus.PastDue,
  ...asOtherAdmin,
});
export const Ending = story('G10. Plan ending', {
  plan: SquadPlan.Team,
  members: team,
  status: PlanStatus.Ending,
});
export const Cancelled = story('G11. Cancelled, cashback frozen', {
  status: PlanStatus.Cancelled,
});
export const FormerTeammate = story('G12. Seat held by a former teammate', {
  plan: SquadPlan.Team,
  members: fullTeam,
  formerId: 'sam',
});

export const TeamAlone = story('G4. Team, no teammates yet', {
  plan: SquadPlan.Team,
  members: [owner],
});
export const ZeroCashback = story('G3. Just bought, no cashback yet', {
  plan: SquadPlan.Starter,
  members: starterTeam,
  balance: '0',
});
export const HalfSetUp = story('G4. Team, page half set up', {
  plan: SquadPlan.Team,
  members: team,
  done: { details: true, links: true, seats: true },
});
export const SetupComplete = story('G13. Page fully set up', {
  plan: SquadPlan.Team,
  members: team,
  isSetupComplete: true,
});

export const UpsellFull: Story = {
  name: 'H1b. Upsell, the entire squad page',
  render: () => <UpsellOnPage />,
};

export const Upsell: Story = {
  name: 'H1. Squad page upsell',
  render: () => (
    <div className="flex min-h-screen w-full justify-center bg-background-default p-6">
      <div className="w-full" style={{ maxWidth: 340 }}>
        <UpsellProposed />
      </div>
    </div>
  ),
};
