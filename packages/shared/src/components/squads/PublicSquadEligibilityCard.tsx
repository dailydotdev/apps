import React, { ReactElement, useCallback, useMemo } from 'react';
import { useActions, useFeedLayout } from '../../hooks';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Card } from '../cards/Card';
import { Card as CardV1 } from '../cards/v1/Card';
import { EarthIcon, MiniCloseIcon, TimerIcon } from '../icons';
import { ProgressBar } from '../fields/ProgressBar';
import { ActionType } from '../../graphql/actions';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

const MIN_POSTS = 3;

interface Props {
  postsCount: number;
  inReview: boolean;
  squadId: string;
}

const PublicSquadEligibilityCard = ({
  postsCount,
  inReview,
  squadId,
}: Props): ReactElement => {
  const { shouldUseListFeedLayout } = useFeedLayout();
  const { completeAction, checkHasCompleted, isActionsFetched } = useActions();
  const { openModal } = useLazyModal();
  const hideCard = useMemo(
    () =>
      isActionsFetched &&
      checkHasCompleted(ActionType.HidePublicSquadEligibilityCard),
    [checkHasCompleted, isActionsFetched],
  );

  const onDismiss = useCallback(() => {
    completeAction(ActionType.HidePublicSquadEligibilityCard);
  }, [completeAction]);

  const onSubmit = useCallback(() => {
    openModal({ type: LazyModal.SubmitSquadForReview, props: { squadId } });
  }, [openModal, squadId]);

  if (hideCard) {
    return null;
  }

  const isEligible = postsCount >= MIN_POSTS;
  const effectivePostsCount = isEligible ? MIN_POSTS : postsCount;

  const CardComponent = shouldUseListFeedLayout ? CardV1 : Card;

  return (
    <CardComponent
      data-testid="publicSquadEligibilityCard"
      className="justify-between !bg-transparent p-4"
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
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between typo-footnote">
          <span className="text-text-secondary">Posts</span>
          <span className="font-bold">{effectivePostsCount}/3</span>
        </div>
        <div className="h-2.5 rounded-10 bg-background-subtle">
          <ProgressBar
            percentage={Math.ceil((effectivePostsCount / 3) * 100)}
            className="!static h-2.5 rounded-10 align-top"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          tag="a"
          href="https://r.daily.dev/public-squads-guide"
        >
          Details
        </Button>
        {inReview ? (
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
};

export default PublicSquadEligibilityCard;
