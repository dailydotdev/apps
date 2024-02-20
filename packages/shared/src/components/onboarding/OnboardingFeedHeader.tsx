import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FilterOnboardingV4 } from './FilterOnboardingV4';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';
import { REQUIRED_TAGS_THRESHOLD } from './common';
import { ArrowIcon } from '../icons';
import { LayoutHeader } from '../layout/common';
import { usePrompt } from '../../hooks/usePrompt';
import { useMyFeed } from '../../hooks/useMyFeed';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';

type OnboardingFeedHeaderProps = {
  isPreviewFeedVisible: boolean;
  setPreviewFeedVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isFeedPreviewEnabled: boolean;
  tagsCount: number;
};

export const OnboardingFeedHeader = ({
  isPreviewFeedVisible,
  setPreviewFeedVisible,
  isFeedPreviewEnabled,
  tagsCount,
}: OnboardingFeedHeaderProps): JSX.Element => {
  let stopNav = true;
  const { updateAlerts } = useAlertsContext();
  const { trackEvent } = useAnalyticsContext();
  const { showPrompt } = usePrompt();
  const router = useRouter();
  const { registerLocalFilters } = useMyFeed();

  const completeOnboarding = useCallback(() => {
    registerLocalFilters();
    updateAlerts({ filter: false, myFeed: 'created' });

    trackEvent({
      event_name: AnalyticsEvent.CreateFeed,
    });
  }, [registerLocalFilters, trackEvent, updateAlerts]);

  const preventNavigation = useCallback(
    (newRoute?: string) => {
      showPrompt({
        title: 'Discard tag selection?',
        description: 'Your personalized feed is only a few tags away',
        cancelButton: {
          title: 'Stay',
          variant: ButtonVariant.Primary,
          color: ButtonColor.Cabbage,
        },
        okButton: {
          title: 'Leave',
          variant: ButtonVariant.Secondary,
        },
      }).then((leave) => {
        if (leave) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          stopNav = false;
          trackEvent({
            event_name: AnalyticsEvent.OnboardingSkip,
          });
          router.replace(newRoute);
        }
      });
    },
    [router, showPrompt],
  );

  const routeHandler = useCallback(
    (newRoute: string) => {
      if (!stopNav) {
        return;
      }
      router.events.emit('routeChangeError');
      preventNavigation(newRoute);
      throw new Error('Cancelling navigation');
    },
    [preventNavigation, router.events, stopNav],
  );

  useEffect(() => {
    router.events.on('routeChangeStart', routeHandler);
    return () => {
      router.events.off('routeChangeStart', routeHandler);
    };
  }, [preventNavigation, routeHandler, router.events, stopNav]);

  return (
    <LayoutHeader className="flex-col overflow-x-visible">
      <div className="fixed z-1 flex w-full justify-center bg-gradient-to-b from-theme-surface-invert via-80% tablet:px-4 tablet:py-10">
        <div className="flex h-44 w-full max-w-[40rem] flex-col items-center border-l-2 border-theme-color-cabbage bg-theme-bg-popover  p-6 tablet:h-auto tablet:flex-row tablet:rounded-16">
          <div className="text-center tablet:text-left">
            <p className="font-bold typo-title3">
              Pick tags that are relevant to you
            </p>
            <p className="text-theme-label-tertiary typo-callout">
              You can always modify your tags later
            </p>
          </div>
          <div className="flex flex-1" />
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            disabled={!isFeedPreviewEnabled}
            onClick={completeOnboarding}
          >
            Create my feed
          </Button>
        </div>
      </div>

      <div className="flex max-w-full flex-col">
        <FilterOnboardingV4 className="mt-44 pt-6 tablet:pt-0" />
        <div className="mt-10 flex items-center justify-center gap-10 text-theme-label-quaternary typo-callout">
          <div className="h-px flex-1 bg-theme-divider-tertiary" />
          <Button
            variant={
              isPreviewFeedVisible
                ? ButtonVariant.Primary
                : ButtonVariant.Secondary
            }
            disabled={!isFeedPreviewEnabled}
            icon={
              <ArrowIcon
                className={classNames(!isPreviewFeedVisible && 'rotate-180')}
              />
            }
            iconPosition={ButtonIconPosition.Right}
            onClick={() => {
              setPreviewFeedVisible((current) => !current);
            }}
          >
            {isFeedPreviewEnabled
              ? `${isPreviewFeedVisible ? 'Hide' : 'Show'} feed preview`
              : `${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
          </Button>
          <div className="h-px flex-1 bg-theme-divider-tertiary" />
        </div>
      </div>
    </LayoutHeader>
  );
};
