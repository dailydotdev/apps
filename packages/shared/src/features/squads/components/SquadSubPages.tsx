import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { PlusIcon } from '../../../components/icons';
import Link from '../../../components/utilities/Link';
import { SourcePermissions } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';
import { SquadModerationList } from '../../../components/squads/moderation/SquadModerationList';
import { useSquadPageContext } from '../SquadPageContext';
import { getSquadProductFormUrl, getSquadUrl } from '../lib/routes';
import { SQUAD_PRODUCTS_MAX } from '../lib/limits';
import { useSquadProducts } from '../hooks/useSquadProducts';
import { SquadPageLayout } from './SquadPageLayout';
import { SquadSubPageHeader } from './SquadSubPageHeader';
import { SquadMembersList } from './SquadMembersList';
import { SquadProductsList } from './products/SquadProductsList';
import { SquadRulesList } from './SquadRulesList';
import { SquadRulesEditButton } from './SquadRulesEditButton';

const useBackToSquad = () => {
  const { squad } = useSquadPageContext();

  return {
    backUrl: getSquadUrl(squad.handle),
    backLabel: `Back to ${squad.name}`,
  };
};

export const SquadMembersPage = (): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <SquadPageLayout
      header={<SquadSubPageHeader title="Members" {...useBackToSquad()} />}
    >
      <SquadMembersList squad={squad} />
    </SquadPageLayout>
  );
};

export const SquadProductsPage = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { products } = useSquadProducts(squad);
  const canAdd =
    verifyPermission(squad, SourcePermissions.Edit) &&
    products.length < SQUAD_PRODUCTS_MAX;
  const addUrl = getSquadProductFormUrl(squad.handle);

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title="Products"
          {...useBackToSquad()}
          action={
            canAdd && (
              <Link href={addUrl} passHref>
                <Button
                  tag="a"
                  variant={ButtonVariant.Subtle}
                  size={ButtonSize.Small}
                  icon={<PlusIcon />}
                >
                  Add product
                </Button>
              </Link>
            )
          }
        />
      }
    >
      <SquadProductsList />
    </SquadPageLayout>
  );
};

export const SquadRulesPage = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const rules = squad.rules ?? [];

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title="Rules"
          {...useBackToSquad()}
          action={
            <SquadRulesEditButton squad={squad} size={ButtonSize.Small} />
          }
        />
      }
    >
      {rules.length ? (
        <SquadRulesList rules={rules} />
      ) : (
        <p className="px-4 py-6 text-text-secondary typo-callout tablet:px-6">
          {squad.name} has no rules yet.
        </p>
      )}
    </SquadPageLayout>
  );
};

export const SquadPendingPostsPage = (): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader title="Pending posts" {...useBackToSquad()} />
      }
    >
      <p className="px-4 pt-4 text-text-secondary typo-callout tablet:px-6">
        Your posts waiting for a moderator of {squad.name}. You hear when they
        are reviewed.
      </p>
      <SquadModerationList squad={squad} isModerator={false} />
    </SquadPageLayout>
  );
};
