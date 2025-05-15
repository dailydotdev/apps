import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { useViewSize, ViewSize } from '../../hooks';
import {
  cloudinaryFeedBgLaptop,
  cloudinaryFeedBgMobile,
  cloudinaryFeedBgTablet,
} from '../../lib/image';
import Logo, { LogoPosition, LogoWithPlus } from '../Logo';
import { CreateFeedButton } from './CreateFeedButton';
import {
  OnboardingStep,
  REQUIRED_TAGS_THRESHOLD,
  wrapperMaxWidth,
} from './common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useInteractiveCompletion } from '../../contexts/InteractiveFeedContext';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { useAuthContext } from '../../contexts/AuthContext';

type OnboardingHeaderProps =
  | {
      showOnboardingPage: boolean;
      onClick: () => void;
      activeScreen: OnboardingStep;
      customActionName?: string;
    }
  | {
      showOnboardingPage: true;
      onClick?: () => void;
      activeScreen?: OnboardingStep;
      customActionName?: string;
    };

export const OnboardingHeader = ({
  showOnboardingPage,
  activeScreen,
  onClick,
  customActionName,
}: OnboardingHeaderProps): ReactElement => {
  const { user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { completion } = useInteractiveCompletion();

  const getImage = () => {
    if (isMobile) {
      return cloudinaryFeedBgMobile;
    }

    return isLaptop ? cloudinaryFeedBgLaptop : cloudinaryFeedBgTablet;
  };

  const showCreateFeedButton: Partial<OnboardingStep[]> = [
    OnboardingStep.EditTag,
    OnboardingStep.ContentTypes,
    OnboardingStep.PWA,
    OnboardingStep.Plus,
    OnboardingStep.PlusPayment,
    OnboardingStep.Extension,
    OnboardingStep.InteractiveFeed,
  ];
  const isPlusStep = [OnboardingStep.Plus, OnboardingStep.PlusPayment].includes(
    activeScreen,
  );
  const fullWidth =
    activeScreen === OnboardingStep.InteractiveFeed ||
    activeScreen === OnboardingStep.PreviewFeed;

  const getCompletionColor = () => {
    if (completion < 25) {
      return 'text-text-tertiary';
    }
    if (completion < 50) {
      return 'text-accent-bun-default';
    }
    if (completion < 75) {
      return 'text-status-help';
    }
    return 'text-status-success';
  };

  if (activeScreen !== OnboardingStep.Intro) {
    return (
      <header
        className={classNames(
          'sticky top-0 z-3 mb-10 flex w-full justify-center backdrop-blur-sm',
          completion > 0 &&
            activeScreen === OnboardingStep.InteractiveFeed &&
            'text-status-help',
        )}
      >
        <img
          className="pointer-events-none absolute left-0 right-0 top-0 z-0 max-h-[12.5rem] w-full"
          src={getImage()}
          alt="Gradient background"
        />
        <div
          className={classNames(
            'flex w-full items-center justify-between !px-4 py-10 tablet:!px-6',
            !fullWidth && ' max-w-4xl ',
          )}
        >
          {!isPlusStep ? (
            <Logo
              logoClassName={{ container: 'h-6' }}
              position={LogoPosition.Relative}
              linkDisabled
            />
          ) : (
            <LogoWithPlus />
          )}
          {activeScreen === OnboardingStep.InteractiveFeed && (
            <div className="z-0 flex flex-col text-center">
              <Typography
                color={TypographyColor.Primary}
                bold
                type={TypographyType.Callout}
              >
                Let&apos;s make your feed work for you
              </Typography>
              <Typography
                type={TypographyType.Body}
                className={getCompletionColor()}
              >
                {completion}% optimized
              </Typography>
            </div>
          )}
          {showCreateFeedButton.includes(activeScreen) && (
            <CreateFeedButton
              onClick={onClick}
              customActionName={customActionName}
              activeScreen={activeScreen}
              requiredTags={REQUIRED_TAGS_THRESHOLD}
            />
          )}
          {activeScreen === OnboardingStep.PreviewFeed && (
            <ProfilePicture user={user} size={ProfileImageSize.Medium} />
          )}
        </div>
      </header>
    );
  }

  if (!showOnboardingPage) {
    return (
      <Logo
        className="w-auto px-10 py-8 laptop:w-full"
        position={LogoPosition.Relative}
        linkDisabled
      />
    );
  }

  return (
    <header
      className={classNames(
        'flew-row mt-6 flex h-full w-full justify-between px-6 tablet:mt-16 laptop:mt-20',
        wrapperMaxWidth,
      )}
    >
      <Logo
        className="w-auto"
        logoClassName={{ container: 'h-6 tablet:h-8' }}
        position={LogoPosition.Relative}
        linkDisabled
      />
    </header>
  );
};
