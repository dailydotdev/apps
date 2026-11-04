import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ModalProps } from '../../components/modals/common/Modal';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Origin } from '../../lib/log';
import { CampaignType } from '../../graphql/campaigns';
import { useCampaignEstimation } from './useCampaignEstimation';
import type { Squad } from '../../graphql/sources';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { BoostModal, useBoostSettings } from './BoostModal';
import { BoostTarget } from './BoostTarget';

interface BoostSquadModalProps extends ModalProps {
  squad: Squad;
  origin?: Origin;
}

export function BoostSquadModal({
  squad,
  origin,
  ...props
}: BoostSquadModalProps): ReactElement {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const canBoost = !!squad.image && !!squad.headerImage && !!squad.description;
  const { default_cores: defaultBudget } = useBoostSettings();
  const [budget, setBudget] = useState(defaultBudget);
  const { estimatedReach, isLoading } = useCampaignEstimation({
    type: CampaignType.Squad,
    query: { budget },
    referenceId: squad.id,
    enabled: canBoost,
  });

  return (
    <BoostModal
      {...props}
      type={CampaignType.Squad}
      referenceId={squad.id}
      walletSourceId={squad.id}
      origin={origin}
      target={
        <BoostTarget
          squad={squad}
          className="rounded-16 border border-border-subtlest-tertiary p-3"
        />
      }
      estimate={{ estimatedReach, isLoading, canBoost }}
      onEstimateBudget={setBudget}
      onBoostSuccess={(data) => {
        if (!data.referenceId) {
          return;
        }

        client.setQueryData<Squad>(
          generateQueryKey(RequestKey.Squad, user, squad.handle),
          (old) =>
            old && {
              ...old,
              flags: { ...old.flags, campaignId: data.referenceId },
            },
        );
      }}
    />
  );
}

export default BoostSquadModal;
