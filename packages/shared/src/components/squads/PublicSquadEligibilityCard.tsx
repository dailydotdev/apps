import React, { ReactElement, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  useActions,
  useFeedLayout,
  useSquad,
  usePublicSquadRequests,
} from '../../hooks';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Card } from '../cards/Card';
import { Card as CardV1 } from '../cards/v1/Card';
import { EarthIcon, MiniCloseIcon, TimerIcon } from '../icons';
import { ActionType } from '../../graphql/actions';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { anchorDefaultRel } from '../../lib/strings';
import { SquadPostsProgressBar } from './SquadPostsProgressBar';
import { squadsPublicGuide } from '../../lib/constants';
import { SquadStatus } from './settings';
import { PlaceholderCard } from '../cards/PlaceholderCard';
import { PUBLIC_SQUAD_REQUEST_REQUIREMENT } from '../../lib/config';

export function PublicSquadEligibilityCard(): ReactElement {
  const router = useRouter();
  const { squad } = useSquad({ handle: router.query.handle as string });
  const { isFetched, status } = usePublicSquadRequests({
    sourceId: squad?.id,
  });
  const postsCount = squad?.flags?.totalPosts;
  const { shouldUseListFeedLayout } = useFeedLayout();
  const { completeAction } = useActions();
  const { openModal } = useLazyModal();

  const onDismiss = useCallback(() => {
    completeAction(ActionType.HidePublicSquadEligibilityCard);
  }, [completeAction]);

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
    return <PlaceholderCard />;
  }

  const isEligible = postsCount >= PUBLIC_SQUAD_REQUEST_REQUIREMENT;
  const CardComponent = shouldUseListFeedLayout ? CardV1 : Card;

  return (
    <CardComponent
      data-testid="publicSquadEligibilityCard"
      className="min-h-[21.75rem] justify-between !bg-transparent p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-6 items-center gap-1 rounded-8 bg-surface-float pl-1 pr-2 text-text-tertiary typo-callout">
          <EarthIcon />
          Public Squad
        </div>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<MiniCloseIcon />}
          onClick={onDismiss}
          aria-label="Close squad eligibility"
        />
      </div>
      <h3 className="font-bold typo-title3">
        Get more traffic by making your Squad public
      </h3>
      <p className="text-text-tertiary typo-callout">
        With Public Squads your posts will organically appear on the daily.dev
        feed giving your content a lot more exposure
      </p>
      <SquadPostsProgressBar postsCount={postsCount} />
      <div className="flex items-center justify-between">
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
          >
            Submit for review
          </Button>
        )}
      </div>
    </CardComponent>
  );
}
