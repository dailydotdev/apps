import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepEditTags } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { EditTag } from '../../../components/onboarding';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';

function FunnelEditTagsComponent({
  parameters: { headline, cta, minimumRequirement, featuredTags },
  onTransition,
}: FunnelStepEditTags): ReactElement | null {
  const { feedSettings } = useFeedSettings();
  const isOnboarding = useIsOnboardingFunnel();
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
      isGlass
      cta={{ label: cta || (isOnboarding ? 'Continue' : 'Next') }}
      // Disabled, not hidden: the bar stays put below the tag minimum, the same
      // as the verify-email step's CTA before a full code is entered. Fading it
      // out left the step with no visible target and no hint that one was
      // coming.
      disabled={isDisabled}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
    >
      <div
        className={classNames(
          funnelStepRail,
          'flex flex-col items-center gap-6 py-6 pt-3 laptop:max-w-screen-laptop',
        )}
      >
        <EditTag
          headline={headline}
          isOnboarding={isOnboarding}
          userId={user?.id ?? trackingId}
          feedSettings={feedSettings}
          featuredTags={featuredTags}
        />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelEditTags = withIsActiveGuard(FunnelEditTagsComponent);
