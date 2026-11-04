import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SquadModerationList } from '../../../../components/squads/moderation/SquadModerationList';
import { SquadDangerZone } from '../../../../components/squads/settings/SquadDangerZone';
import { useSquadPageContext } from '../../SquadPageContext';
import { useSquadManageGroups } from '../../hooks/useSquadManageGroups';
import { isJoinedViewer } from '../../lib/viewer';
import {
  getSquadManageUrl,
  getSquadPendingPostsUrl,
  getSquadUrl,
  SquadManageSection,
} from '../../lib/routes';
import { SquadMembersList } from '../SquadMembersList';
import {
  SquadManageLayout,
  SquadManageSectionPanel,
} from './SquadManageLayout';
import { SquadManageDetails } from './SquadManageDetails';
import { SquadManagePosting } from './SquadManagePosting';
import { SquadManageLinks } from './SquadManageLinks';
import { SquadManageBranding } from './SquadManageBranding';
import { SquadManageRules } from './SquadManageRules';
import {
  SquadManageProductForm,
  SquadManageProducts,
} from './SquadManageProducts';
import { SquadManageAnalytics } from './SquadManageAnalytics';
import { SquadManageIntegrations } from './SquadManageIntegrations';
import { SquadManagePlan } from './SquadManagePlan';

const SectionContent = ({
  section,
}: {
  section: SquadManageSection;
}): ReactElement => {
  const { squad } = useSquadPageContext();

  switch (section) {
    case SquadManageSection.Products:
      return <SquadManageProducts />;
    case SquadManageSection.Links:
      return <SquadManageLinks />;
    case SquadManageSection.Branding:
      return <SquadManageBranding />;
    case SquadManageSection.Rules:
      return <SquadManageRules />;
    case SquadManageSection.Members:
      return (
        <SquadManageSectionPanel section={section}>
          <SquadMembersList squad={squad} />
        </SquadManageSectionPanel>
      );
    case SquadManageSection.Moderation:
      return (
        <SquadManageSectionPanel section={section}>
          <SquadModerationList squad={squad} isModerator />
        </SquadManageSectionPanel>
      );
    case SquadManageSection.Posting:
      return <SquadManagePosting />;
    case SquadManageSection.Analytics:
      return <SquadManageAnalytics />;
    case SquadManageSection.Integrations:
      return <SquadManageIntegrations />;
    case SquadManageSection.Plan:
      return <SquadManagePlan />;
    case SquadManageSection.DangerZone:
      return (
        <SquadManageSectionPanel section={section}>
          <div className="px-4 py-6 tablet:px-6">
            <SquadDangerZone squad={squad} />
          </div>
        </SquadManageSectionPanel>
      );
    default:
      return <SquadManageDetails />;
  }
};

interface SquadManagePageProps {
  section?: SquadManageSection;
  /** Set on the product form routes: an id edits, `null` adds. */
  productId?: string | null;
}

export const SquadManagePage = ({
  section,
  productId,
}: SquadManagePageProps): ReactElement | null => {
  const router = useRouter();
  const { squad, viewer, isViewerReady } = useSquadPageContext();
  const { groups, isLoading: isGroupsLoading } = useSquadManageGroups();
  const sections = groups.flatMap(({ items }) => items.map(({ id }) => id));
  const isReady = isViewerReady && !isGroupsLoading;
  const isAllowed = !section || sections.includes(section);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!sections.length) {
      // Authors land here from moderation links; their queue is Pending posts.
      const isAuthor =
        section === SquadManageSection.Moderation && isJoinedViewer(viewer);
      router.replace(
        isAuthor
          ? getSquadPendingPostsUrl(squad.handle)
          : getSquadUrl(squad.handle),
      );
      return;
    }

    if (!isAllowed) {
      router.replace(getSquadManageUrl(squad.handle));
    }
  }, [isAllowed, isReady, router, section, sections.length, squad, viewer]);

  if (!isReady || !sections.length || !isAllowed) {
    return null;
  }

  const isProductForm = productId !== undefined;

  return (
    <SquadManageLayout section={section}>
      {isProductForm ? (
        <SquadManageProductForm productId={productId ?? undefined} />
      ) : (
        <SectionContent section={section ?? sections[0]} />
      )}
    </SquadManageLayout>
  );
};
