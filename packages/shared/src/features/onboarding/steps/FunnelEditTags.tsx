import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepEditTags } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { EditTag } from '../../../components/onboarding/EditTag';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper } from '../shared/FunnelStepCtaWrapper';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function FunnelEditTagsComponent({
  parameters: { headline, cta, minimumRequirement },
  onTransition,
}: FunnelStepEditTags): ReactElement | null {
  const { completeAction } = useActions();
  const { feedSettings } = useFeedSettings();
  const { user, trackingId } = useAuthContext();
  const handleComplete = () => {
    completeAction(ActionType.EditTag);
    onTransition({ type: FunnelStepTransitionType.Complete });
  };
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isDisabled = tagsCount < minimumRequirement;

  return (
    <FunnelStepCtaWrapper
      cta={{ label: cta || 'Next' }}
      disabled={isDisabled}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96">
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
