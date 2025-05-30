import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import type { FunnelStepEditTags } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { EditTag } from '../../../components/onboarding';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper } from '../shared';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function FunnelEditTagsComponent({
  parameters: { headline, cta, minimumRequirement },
  onTransition,
}: FunnelStepEditTags): ReactElement | null {
  const { completeAction, checkHasCompleted } = useActions();
  const { feedSettings } = useFeedSettings();
  const { user, trackingId } = useAuthContext();
  const handleComplete = () => {
    completeAction(ActionType.EditTag);
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        tags: feedSettings?.includeTags ?? [],
      },
    });
  };
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isDisabled = tagsCount < minimumRequirement;
  const hasCompleted = useMemo(
    () => user && checkHasCompleted(ActionType.EditTag),
    [checkHasCompleted, user],
  );

  useEffect(() => {
    if (hasCompleted && feedSettings?.includeTags.length) {
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: { tags: feedSettings?.includeTags },
      });
    }
  }, [feedSettings?.includeTags, hasCompleted, onTransition]);

  if (!user || hasCompleted) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      cta={{ label: cta || 'Next' }}
      disabled={isDisabled}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-md laptop:max-w-screen-laptop">
        <EditTag
          headline={headline}
          userId={user?.id ?? trackingId}
          feedSettings={feedSettings}
          onClick={handleComplete}
        />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelEditTags = withIsActiveGuard(FunnelEditTagsComponent);
