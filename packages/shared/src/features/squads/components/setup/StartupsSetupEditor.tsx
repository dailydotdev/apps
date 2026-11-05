import type { ReactElement } from 'react';
import React, { useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { IconSize } from '../../../../components/Icon';
import { MoveToIcon } from '../../../../components/icons';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import { squadSubscriptionQueryOptions } from '../../../../graphql/squadSubscription';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { useSquadProducts } from '../../hooks/useSquadProducts';
import { SquadManageBranding } from '../manage/SquadManageBranding';
import { SquadManageDetails } from '../manage/SquadManageDetails';
import { SquadManageEmbedContext } from '../manage/SquadManageLayout';
import { SquadManageLinks } from '../manage/SquadManageLinks';
import { SquadManageSeats } from '../manage/SquadManagePlan';
import { SquadManageProductForm } from '../manage/SquadManageProducts';

export type StartupsSetupRow =
  | 'details'
  | 'links'
  | 'product'
  | 'cta'
  | 'seats';

const SeatsEditor = ({ squad }: { squad: Squad }): ReactElement | null => {
  const { user } = useAuthContext();
  const { data: subscription } = useQuery(
    squadSubscriptionQueryOptions({ user, sourceId: getSquadId(squad) }),
  );

  if (!subscription) {
    return null;
  }

  return (
    <div className="p-4 tablet:p-6">
      <SquadManageSeats
        subscription={subscription}
        isAdmin={squad.currentMember?.role === SourceMemberRole.Admin}
      />
    </div>
  );
};

const ProductEditor = ({ squad }: { squad: Squad }): ReactElement => {
  const { products } = useSquadProducts(squad);

  return <SquadManageProductForm productId={products[0]?.id} />;
};

/**
 * The settings page behind a checklist row, inside the onboarding: its content
 * without the settings sidebar, under a header of our own. On desktop it fills the
 * right box, and on a phone it's a page of its own. Back and a successful save
 * both return to the checklist, never to settings.
 */
export const StartupsSetupEditor = ({
  squad,
  row,
  title,
  isPage,
  onClose,
}: {
  squad: Squad;
  row: StartupsSetupRow;
  title: string;
  /** A phone: the whole screen, not the right box. */
  isPage?: boolean;
  onClose: () => void;
}): ReactElement => {
  const pageRef = useRef<HTMLDivElement>(null);
  const embed = useMemo(() => ({ onSaved: onClose }), [onClose]);

  // The real pages save by submitting their form. Seats have none: each one
  // saves as it's given.
  const onSave = () => {
    const form = pageRef.current?.querySelector('form');

    if (form) {
      form.requestSubmit();
      return;
    }

    onClose();
  };

  return (
    <div
      className={classNames(
        'flex w-full flex-col bg-background-default text-text-primary',
        isPage ? 'min-h-dvh' : 'min-h-full',
      )}
    >
      <header
        className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-default px-2"
        style={{ zIndex: 3 }}
      >
        <Button
          aria-label="Back to the checklist"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MoveToIcon size={IconSize.Size16} className="rotate-180" />}
          onClick={onClose}
        />
        <h2 className="min-w-0 flex-1 truncate font-bold typo-callout">
          {title}
        </h2>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onSave}
        >
          Save
        </Button>
      </header>
      <div ref={pageRef} className="flex flex-1 flex-col">
        <SquadPageContextProvider squad={squad} isViewerReady>
          <SquadManageEmbedContext.Provider value={embed}>
            {row === 'details' && <SquadManageDetails />}
            {row === 'links' && <SquadManageLinks />}
            {row === 'product' && <ProductEditor squad={squad} />}
            {row === 'cta' && <SquadManageBranding />}
            {row === 'seats' && <SeatsEditor squad={squad} />}
          </SquadManageEmbedContext.Provider>
        </SquadPageContextProvider>
      </div>
    </div>
  );
};
