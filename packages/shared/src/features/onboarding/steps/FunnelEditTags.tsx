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
      cta={{ label: cta }}
      // Onboarding disables the CTA below the minimum; the paid funnel hides it.
      {...(isOnboarding
        ? { disabled: isDisabled }
        : {
            'aria-hidden': isDisabled,
            className: classNames({
              'opacity-0': isDisabled,
              'pointer-events-none': isDisabled,
            }),
          })}
      onClick={handleComplete}
      containerClassName={classNames(
        'flex w-full flex-1 flex-col items-center overflow-hidden',
        !isOnboarding && 'laptop:justify-center',
      )}
    >
      <div
        className={classNames(
          'flex flex-col items-center gap-6 laptop:max-w-screen-laptop',
          isOnboarding
            ? classNames(funnelStepRail, 'py-6 pt-3')
            : 'w-full p-6 pt-10 tablet:max-w-md',
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
