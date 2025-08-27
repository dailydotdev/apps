import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepEditTags } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { EditTag } from '../../../components/onboarding';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper } from '../shared';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function FunnelEditTagsComponent({
  parameters: { headline, cta, minimumRequirement },
  onTransition,
}: FunnelStepEditTags): ReactElement | null {
  const { feedSettings } = useFeedSettings();
  const { user, trackingId } = useAuthContext();
  const handleComplete = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        tags: feedSettings?.includeTags ?? [],
      },
    });
  };
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isDisabled = tagsCount < minimumRequirement;

  if (!user) {
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
        />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelEditTags = withIsActiveGuard(FunnelEditTagsComponent);
