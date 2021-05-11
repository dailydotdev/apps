/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import RankProgress from '../RankProgress';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import styled from '@emotion/styled';
import { RankConfetti } from '../svg/RankConfetti';
import { RANK_NAMES, rankToColor, STEPS_PER_RANK } from '../../lib/rank';
import { LoggedUser } from '../../lib/user';
import { typoCallout, typoTitle2 } from '../../styles/typography';
import { Checkbox } from '@dailydotdev/shared';
import LoginButtons from '../LoginButtons';
import RadialProgress from '../RadialProgress';
import Rank from '../Rank';
import { CSSTransition } from 'react-transition-group';
import {
  Button,
  ModalCloseButton,
  ModalProps,
  ResponsiveModal,
  responsiveModalBreakpoint,
} from '@dailydotdev/shared';

export interface NewRankModalProps extends Omit<ModalProps, 'onRequestClose'> {
  rank: number;
  progress: number;
  user?: LoggedUser;
  onRequestClose?: (neverShowAgain: boolean) => unknown;
}

const radialProgressSize = sizeN(27);
const largeRadialProgressSize = sizeN(42);
const badgeSize = sizeN(12);
const largeBadgeSize = sizeN(16);

const StyledConfetti = styled(RankConfetti)<{ rank: number }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  margin: 0 auto;

  ${({ rank }) =>
    rank < RANK_NAMES.length &&
    `
  path {
    fill: ${rankToColor(rank)};
  }`}
`;

const ProfileImage = styled.img`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: ${sizeN(17.5)};
  height: ${sizeN(17.5)};
  object-fit: cover;
  margin: auto;
  border-radius: 100%;

  ${responsiveModalBreakpoint} {
    width: ${sizeN(30)};
    height: ${sizeN(30)};
  }
`;

const NewRankBadge = styled(Rank)`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${sizeN(4)};
  width: ${badgeSize};
  height: ${badgeSize};
  margin: 0 auto;
  border-radius: 100%;
  background: var(--theme-background-tertiary);
  transform: translateX(calc((${radialProgressSize} - ${badgeSize}) / 2));

  ${responsiveModalBreakpoint} {
    width: ${largeBadgeSize};
    height: ${largeBadgeSize};
    transform: translateX(
      calc((${largeRadialProgressSize} - ${largeBadgeSize}) / 2)
    );
  }
`;

const RankProgressContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${sizeN(35)};
  margin-top: ${sizeN(6)};

  ${responsiveModalBreakpoint} {
    height: ${sizeN(50)};
  }

  & .confetti-transition-enter-active,
  & .confetti-transition-exit-active {
    transform-origin: center;
    transition: opacity 0.3s linear, transform 0.3s ease-out;
    will-change: opacity, transform;
  }

  && .confetti-transition-enter-active,
  & .confetti-transition-exit {
    opacity: 1;
    transform: scale(1);
  }

  & .confetti-transition-enter,
  .confetti-transition-exit-active {
    opacity: 0;
    transform: scale(0);
  }
`;

const Title = styled.h1`
  margin: ${sizeN(2)} 0 0;
  font-weight: bold;
  text-align: center;
  ${typoTitle2}
`;

const Para = styled.p`
  margin: ${sizeN(1)} 0 ${sizeN(8)};
  color: var(--theme-label-secondary);
  text-align: center;
  ${typoCallout}
`;

export default function NewRankModal({
  rank,
  progress,
  user,
  onRequestClose,
  ...props
}: NewRankModalProps): ReactElement {
  const [shownRank, setShownRank] = useState(rank - 1);
  const [shownProgress, setShownProgress] = useState(progress);
  const [animatingRank, setAnimatingRank] = useState(false);
  const [rankAnimationEnded, setRankAnimationEnded] = useState(false);
  const inputRef = useRef<HTMLInputElement>();

  const title = useMemo(() => {
    if (user) {
      const firstName = user.name.split(' ')[0];
      if (rank === 1) {
        return `Wow, ${firstName}!`;
      }
      if (rank === 2) {
        return `You rock, ${firstName}!`;
      }
      if (rank === 3) {
        return `That's epic, ${firstName}!`;
      }
      if (rank === 4) {
        return `Fantastic, ${firstName}!`;
      }
      return `Legendary, ${firstName}!`;
    }
    return 'Good job!';
  }, [rank, user]);

  const closeModal = () => {
    onRequestClose?.(inputRef.current?.checked);
  };

  useEffect(() => {
    const animateRank = () => {
      if (document.visibilityState === 'hidden') {
        document.addEventListener(
          'visibilitychange',
          () => setTimeout(() => this.animateRank(), 1000),
          { once: true },
        );
      } else {
        setAnimatingRank(true);
        setShownRank(rank);
        setShownProgress(STEPS_PER_RANK[rank - 1]);
      }
    };

    setTimeout(() => animateRank(), 1500);
  }, []);

  const onRankAnimationFinish = () => {
    setTimeout(() => setRankAnimationEnded(true), 700);
  };

  return (
    <ResponsiveModal
      onRequestClose={closeModal}
      {...props}
      css={css`
        .modal {
          max-width: ${sizeN(105)};

          ${responsiveModalBreakpoint} {
            box-sizing: content-box;
            border: ${sizeN(1)} solid ${rankToColor(rank)};
          }
        }
      `}
    >
      <ModalCloseButton onClick={closeModal} />
      <RankProgressContainer>
        {!user || !rankAnimationEnded ? (
          <RankProgress
            rank={shownRank}
            progress={shownProgress}
            fillByDefault
            showRankAnimation={animatingRank}
            css={css`
              font-size: ${radialProgressSize};
              ${responsiveModalBreakpoint} {
                font-size: ${largeRadialProgressSize};
              }
            `}
            onRankAnimationFinish={onRankAnimationFinish}
          />
        ) : (
          <>
            <RadialProgress
              progress={STEPS_PER_RANK[rank - 1]}
              steps={STEPS_PER_RANK[rank - 1]}
              maxDegrees={270}
              css={css`
                font-size: ${radialProgressSize};
                --radial-progress-step: ${rankToColor(rank)};
                ${responsiveModalBreakpoint} {
                  font-size: ${largeRadialProgressSize};
                }
              `}
            />
            <ProfileImage src={user.image} alt="Your profile picture" />
            <NewRankBadge rank={rank} colorByRank />
          </>
        )}
        <CSSTransition
          in={rankAnimationEnded}
          timeout={300}
          classNames="confetti-transition"
          mountOnEnter
          unmountOnExit
        >
          <StyledConfetti rank={rank} />
        </CSSTransition>
      </RankProgressContainer>
      <Title>{title}</Title>
      <Para>
        You earned the {RANK_NAMES[rank - 1]?.toLowerCase()} rank
        {!user && (
          <>
            <br />
            <br />
            Add your new rank to your profile by signing up
          </>
        )}
      </Para>
      {user ? (
        <Button
          className="btn-primary"
          onClick={closeModal}
          css={css`
            align-self: center;
          `}
        >
          Awesome!
        </Button>
      ) : (
        <LoginButtons />
      )}
      <Checkbox
        ref={inputRef}
        name="neverShow"
        css={css`
          align-self: center;
          margin: ${sizeN(6)} 0 ${sizeN(7)};
        `}
      >
        Never show this popup again
      </Checkbox>
    </ResponsiveModal>
  );
}
