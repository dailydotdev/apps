import React, { useCallback } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { squadsPublicGuide } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { SquadStatus } from './settings';
import { TimerIcon } from '../icons';
import { usePublicSquadRequests } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { PUBLIC_SQUAD_REQUEST_REQUIREMENT } from '../../lib/config';
import { LazyModal } from '../modals/common/types';
import { Squad } from '../../graphql/sources';

interface PublicSquadSubmissionActionsProps {
  squad: Squad;
  isDetailsVisible?: boolean;
}

export const PublicSquadSubmissionActions = (
  props: PublicSquadSubmissionActionsProps,
) => {
  const { squad, isDetailsVisible = true } = props;
  const { isFetched, status } = usePublicSquadRequests({
    sourceId: squad?.id,
  });
  const { openModal } = useLazyModal();
  const postsCount = squad?.flags?.totalPosts ?? 0;
  const isEligible = postsCount >= PUBLIC_SQUAD_REQUEST_REQUIREMENT;

  const onSubmit = useCallback(() => {
    if (!squad.id) {
      return;
    }

    openModal({
      type: LazyModal.SubmitSquadForReview,
      props: { squadId: squad.id },
    });
  }, [openModal, squad]);

  if (!isFetched) {
    return null;
  }

  console.log(squad, { status });

  return (
    <div className="flex items-center justify-between">
      {isDetailsVisible && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          tag="a"
          href={squadsPublicGuide}
          target="_blank"
          rel={anchorDefaultRel}
        >
          Details
        </Button>
      )}
      {status === SquadStatus.Pending ? (
        <div className="flex gap-1 pr-3 font-bold text-text-tertiary typo-callout">
          <TimerIcon />
          In review
        </div>
      ) : (
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled={!isEligible}
          onClick={onSubmit}
          type="button"
        >
          Submit for review
        </Button>
      )}
    </div>
  );
};

export default PublicSquadSubmissionActions;
