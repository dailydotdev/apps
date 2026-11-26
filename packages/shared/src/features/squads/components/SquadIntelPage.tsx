import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useAuthContext } from '../../../contexts/AuthContext';
import { squadSubscriptionQueryOptions } from '../../../graphql/squadSubscription';
import { useSquadPageContext } from '../SquadPageContext';
import { getSquadId } from '../lib/features';
import { getSquadUrl } from '../lib/routes';
import { isStaffViewer } from '../lib/viewer';
import { SquadPageLayout } from './SquadPageLayout';
import { SquadSubPageHeader } from './SquadSubPageHeader';
import { SquadFirstPostIntel } from './firstPost/SquadFirstPostIntel';

/**
 * The page's weekly intel at its own address, for its paid seats, or its
 * admins while it has no plan.
 */
export const SquadIntelPage = (): ReactElement | null => {
  const { squad, viewer, isViewerKnown } = useSquadPageContext();
  const { user } = useAuthContext();
  const isSeat = !!squad.currentMember?.seat;
  const isStaff = isViewerKnown && isStaffViewer(viewer);
  const { data: subscription, isPending } = useQuery({
    ...squadSubscriptionQueryOptions({ user, sourceId: getSquadId(squad) }),
    enabled: !!user && isStaff && !isSeat,
  });

  if (!isViewerKnown || (isStaff && !isSeat && isPending)) {
    return null;
  }

  if (isSeat || (isStaff && !subscription?.plan)) {
    return <SquadFirstPostIntel />;
  }

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title="Weekly intel"
          backUrl={getSquadUrl(squad.handle)}
          backLabel={`Back to ${squad.name}`}
        />
      }
    >
      <div className="flex flex-col gap-1 p-6">
        <Typography type={TypographyType.Callout} bold>
          The weekly intel is for paid seats
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {`Ask an admin of ${squad.name} for a seat in Manage › Plan.`}
        </Typography>
      </div>
    </SquadPageLayout>
  );
};
