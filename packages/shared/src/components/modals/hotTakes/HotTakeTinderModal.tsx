import type { ReactElement } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalSize } from '../common/types';
import { useDiscoverHotTakes } from '../../../hooks/useDiscoverHotTakes';
import { useVoteHotTake } from '../../../hooks/vote/useVoteHotTake';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import { webappUrl } from '../../../lib/constants';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { HotIcon } from '../../icons/Hot';
import { DownvoteIcon } from '../../icons/Downvote';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../../ProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import { VerifiedCompanyUserBadge } from '../../VerifiedCompanyUserBadge';
import { PlusUserBadge } from '../../PlusUserBadge';
import type { HotTake } from '../../../graphql/user/userHotTake';

const SWIPE_THRESHOLD = 80;

const HotTakeCard = ({
  hotTake,
  isTop,
  offset,
  swipeDelta,
}: {
  hotTake: HotTake;
  isTop: boolean;
  offset: number;
  swipeDelta: number;
}): ReactElement => {
  const rotation = isTop ? swipeDelta * 0.1 : 0;
  const translateX = isTop ? swipeDelta : 0;
  const scale = isTop ? 1 : 1 - offset * 0.05;
  const translateY = isTop ? 0 : offset * 8;

  const getSwipeDirection = () => {
    if (Math.abs(swipeDelta) <= 20) {
      return null;
    }
    return swipeDelta > 0 ? 'right' : 'left';
  };
  const swipeDirection = getSwipeDirection();

  return (
    <div
      className={classNames(
        'absolute inset-0 flex flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-float shadow-2',
        !isTop && 'pointer-events-none',
      )}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: 10 - offset,
        transition: isTop ? 'none' : 'transform 0.3s ease',
      }}
    >
      {isTop && swipeDirection && (
        <div
          className={classNames(
            'z-10 absolute left-4 right-4 top-4 rounded-12 py-2 text-center font-bold typo-title3',
            swipeDirection === 'right'
              ? 'border-2 border-accent-cabbage-default text-accent-cabbage-default'
              : 'border-2 border-accent-blueCheese-default text-accent-blueCheese-default',
          )}
        >
          {swipeDirection === 'right' ? 'HOT' : 'COLD'}
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <div className="flex size-16 items-center justify-center rounded-16 bg-overlay-quaternary-cabbage text-[2.5rem]">
          {hotTake.emoji}
        </div>

        <Typography
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
          className="text-center"
        >
          {hotTake.title}
        </Typography>

        {hotTake.subtitle && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            {hotTake.subtitle}
          </Typography>
        )}

        {hotTake.upvotes > 0 && (
          <div className="flex items-center gap-1 rounded-10 bg-surface-hover px-3 py-1">
            <HotIcon className="text-accent-cabbage-default" />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Secondary}
              bold
            >
              {hotTake.upvotes}
            </Typography>
          </div>
        )}
      </div>

      {hotTake.user && (
        <a
          href={hotTake.user.permalink}
          className="flex items-center gap-3 border-t border-border-subtlest-tertiary p-4 hover:bg-surface-hover"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ProfilePicture
            user={hotTake.user}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1">
              <span className="truncate font-bold typo-callout">
                {hotTake.user.name}
              </span>
              {hotTake.user.isPlus && (
                <PlusUserBadge
                  user={{ isPlus: hotTake.user.isPlus }}
                  tooltip={false}
                />
              )}
              <span className="truncate text-text-tertiary typo-footnote">
                @{hotTake.user.username}
              </span>
            </div>
            <div className="flex gap-2">
              <ReputationUserBadge user={hotTake.user} disableTooltip />
              {hotTake.user.companies?.length > 0 && (
                <VerifiedCompanyUserBadge
                  user={{ companies: hotTake.user.companies }}
                />
              )}
            </div>
          </div>
        </a>
      )}
    </div>
  );
};

const EmptyState = ({
  onClose,
  username,
}: {
  onClose: ModalProps['onRequestClose'];
  username?: string;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
    <span className="text-[3rem]">🎉</span>
    <Typography
      type={TypographyType.Title3}
      color={TypographyColor.Primary}
      bold
      className="text-center"
    >
      You&apos;ve seen all the hot takes!
    </Typography>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Tertiary}
      className="text-center"
    >
      Share your own hot takes and let others vote on them.
    </Typography>
    {username && (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        tag="a"
        href={`${webappUrl}${username}#hot-takes`}
        onClick={(e) => {
          onClose?.(e);
        }}
      >
        Share your hot takes
      </Button>
    )}
  </div>
);

const HotTakeTinderModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const { currentTake, nextTake, isEmpty, isLoading, dismissCurrent } =
    useDiscoverHotTakes();
  const { toggleUpvote } = useVoteHotTake();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDismiss = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentTake || isAnimating) {
        return;
      }

      setIsAnimating(true);

      logEvent({
        event_name: LogEvent.SwipeHotTake,
        target_id: currentTake.id,
        extra: JSON.stringify({ direction, hotTakeId: currentTake.id }),
      });

      if (direction === 'right') {
        toggleUpvote({
          payload: currentTake,
          origin: Origin.HotTakeTinder,
        });
      }

      // Animate card off screen
      const flyDistance = direction === 'right' ? 500 : -500;
      setSwipeDelta(flyDistance);

      setTimeout(() => {
        dismissCurrent();
        setSwipeDelta(0);
        setIsAnimating(false);
      }, 200);
    },
    [currentTake, isAnimating, dismissCurrent, toggleUpvote, logEvent],
  );

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (isAnimating) {
        return;
      }
      setSwipeDelta(e.deltaX);
    },
    onSwipedLeft: () => {
      if (Math.abs(swipeDelta) > SWIPE_THRESHOLD) {
        handleDismiss('left');
      } else {
        setSwipeDelta(0);
      }
    },
    onSwipedRight: () => {
      if (Math.abs(swipeDelta) > SWIPE_THRESHOLD) {
        handleDismiss('right');
      } else {
        setSwipeDelta(0);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
      isDrawerOnMobile
    >
      <Modal.Header title="Hot Takes" />
      <Modal.Body className="!p-0">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center p-6">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Loading hot takes...
            </Typography>
          </div>
        )}

        {!isLoading && isEmpty && (
          <EmptyState onClose={onRequestClose} username={user?.username} />
        )}

        {!isLoading && !isEmpty && currentTake && (
          <>
            <div
              {...handlers}
              ref={cardRef}
              className="relative mx-4 mt-2"
              style={{ height: '22rem' }}
            >
              {nextTake && (
                <HotTakeCard
                  hotTake={nextTake}
                  isTop={false}
                  offset={1}
                  swipeDelta={0}
                />
              )}
              <HotTakeCard
                hotTake={currentTake}
                isTop
                offset={0}
                swipeDelta={swipeDelta}
              />
            </div>

            <div className="flex items-center justify-center gap-8 p-4">
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                icon={
                  <DownvoteIcon className="rotate-90 text-accent-blueCheese-default" />
                }
                onClick={() => handleDismiss('left')}
                disabled={isAnimating}
                className="!size-14 rounded-full"
                aria-label="Cold take - skip"
              />
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Large}
                icon={<HotIcon className="text-accent-cabbage-default" />}
                onClick={() => handleDismiss('right')}
                disabled={isAnimating}
                className="!size-14 rounded-full"
                aria-label="Hot take - upvote"
              />
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HotTakeTinderModal;
