import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MoveToIcon } from '@dailydotdev/shared/src/components/icons';
import { toSquadHandle } from '@dailydotdev/shared/src/features/squads/lib/handle';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { SquadManageBranding } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageBranding';
import { SquadManageDetails } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageDetails';
import { SquadManageLinks } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLinks';
import { SquadManageProductForm } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageProducts';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { SquadProduct } from '@dailydotdev/shared/src/graphql/squadProducts';
import {
  acmeTeam,
  owner,
  Seeded,
  team,
  teamPlan,
} from '../startups-playgrounds/seed';
import { Seats } from './manage';

// The settings page behind a checklist row, inside the onboarding: its content
// without the settings sidebar, under a header of our own. On desktop it fills
// the right box, and on a phone it's a page of its own. Back and Save both return
// to the checklist, never to settings, and Save ticks the row.

export const sampleProduct = {
  id: 'acme-cli',
  title: 'Acme CLI',
  slug: 'acme-cli',
  url: 'https://acme.dev/cli',
  faviconUrl: '/squad-page/acme-logo.svg',
  category: 'Developer tools',
  tagline: 'Preview every pull request.',
  description: 'One command for a live preview of any branch.',
  pricingModel: null,
} as unknown as SquadProduct;

const EDITOR_STYLES = `
.startups-editor-page > .h-14 { display: none !important; }
`;

export const SetupEditor = ({
  rowId,
  title,
  company,
  isDone,
  isPage,
  onBack,
  onSave,
}: {
  rowId: string;
  title: string;
  company: string;
  isDone?: boolean;
  /** A phone: the whole screen, not the right box. */
  isPage?: boolean;
  onBack: () => void;
  onSave: () => void;
}): ReactElement => {
  const pageRef = useRef<HTMLDivElement>(null);
  const squad = {
    ...acmeTeam,
    name: company,
    handle: toSquadHandle(company),
  } as Squad;

  // The real pages submit their form. Here that's the moment the row is done,
  // and nothing is sent. Seats have no form: each one saves as it's given.
  const onSaveClick = () => {
    const form = pageRef.current?.querySelector('form');

    if (form) {
      form.requestSubmit();
      return;
    }

    onSave();
  };

  return (
    <div
      className={
        isPage
          ? 'flex min-h-dvh w-full flex-col bg-background-default text-text-primary'
          : 'flex min-h-full w-full flex-col'
      }
    >
      <style dangerouslySetInnerHTML={{ __html: EDITOR_STYLES }} />
      <header
        className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-2"
        style={{ zIndex: 3 }}
      >
        <Button
          aria-label="Back to the checklist"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MoveToIcon className="rotate-180" />}
          onClick={onBack}
        />
        <h2 className="min-w-0 flex-1 truncate font-bold typo-callout">
          {title}
        </h2>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSaveClick}
        >
          Save
        </Button>
      </header>
      <div
        ref={pageRef}
        className="startups-editor-page flex flex-1 flex-col"
        onSubmitCapture={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSave();
        }}
      >
        <Seeded
          squad={squad}
          subscription={teamPlan}
          products={rowId === 'product' && isDone ? [sampleProduct] : []}
        >
          {rowId === 'details' && <SquadManageDetails />}
          {rowId === 'links' && <SquadManageLinks />}
          {rowId === 'product' && (
            <SquadManageProductForm
              productId={isDone ? sampleProduct.id : undefined}
            />
          )}
          {rowId === 'cta' && <SquadManageBranding />}
          {rowId === 'seats' && (
            <div className="p-4 tablet:p-6">
              <Seats
                plan={SquadPlan.Team}
                members={team}
                ownerId={owner.user.id}
                canManage
              />
            </div>
          )}
        </Seeded>
      </div>
    </div>
  );
};
