import React, {
  CSSProperties,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RankProgress } from '../RankProgress';
import { RankConfetti } from '../../svg/RankConfetti';
import { RANK_NAMES, rankToColor, STEPS_PER_RANK } from '../../lib/rank';
import { LoggedUser } from '../../lib/user';
import { Checkbox } from '../fields/Checkbox';
import LoginButtons from '../LoginButtons';
import RadialProgress from '../RadialProgress';
import Rank from '../Rank';
import { CSSTransition } from 'react-transition-group';
import { Button } from '../buttons/Button';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './NewRankModal.module.css';
import classNames from 'classnames';

export interface NewRankModalProps extends Omit<ModalProps, 'onRequestClose'> {
  rank: number;
  progress: number;
  user?: LoggedUser;
  onRequestClose?: (neverShowAgain: boolean) => unknown;
}

export default function NewRankModal({
  rank,
  progress,
  user,
  onRequestClose,
  className,
  style,
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
      className={classNames(styles.newRankModal, className)}
      style={{
        content: {
          ...style?.content,
          '--rank-color': rankToColor(rank),
        } as CSSProperties,
        overlay: style?.overlay,
      }}
      {...props}
    >
      <ModalCloseButton onClick={closeModal} />
      <div
        className={`${styles.rankProgressContainer} relative flex items-center justify-center mt-6`}
      >
        {!user || !rankAnimationEnded ? (
          <RankProgress
            rank={shownRank}
            progress={shownProgress}
            fillByDefault
            showRankAnimation={animatingRank}
            className={styles.rankProgress}
            onRankAnimationFinish={onRankAnimationFinish}
          />
        ) : (
          <>
            <RadialProgress
              progress={STEPS_PER_RANK[rank - 1]}
              steps={STEPS_PER_RANK[rank - 1]}
              maxDegrees={270}
              className={styles.radialProgress}
            />
            <img
              className={`${styles.profileImage} absolute inset-0 object-cover m-auto rounded-full`}
              src={user.image}
              alt="Your profile picture"
            />
            <Rank
              className={`${styles.newRankBadge} absolute inset-x-0 bottom-4 mx-auto rounded-full bg-theme-bg-tertiary`}
              rank={rank}
              colorByRank
            />
          </>
        )}
        <CSSTransition
          in={rankAnimationEnded}
          timeout={300}
          classNames="confetti-transition"
          mountOnEnter
          unmountOnExit
        >
          <RankConfetti
            className={`${styles.rankConfetti} absolute inset-x-0 top-0 h-full mx-auto`}
            style={
              {
                '--fill-color': rank < RANK_NAMES.length && 'var(--rank-color)',
              } as CSSProperties
            }
          />
        </CSSTransition>
      </div>
      <h1 className="mt-2 font-bold text-center typo-callout">{title}</h1>
      <p className="mt-1 mb-8 text-theme-label-secondary text-center typo-callout">
        You earned the {RANK_NAMES[rank - 1]?.toLowerCase()} rank
        {!user && (
          <>
            <br />
            <br />
            Add your new rank to your profile by signing up
          </>
        )}
      </p>
      {user ? (
        <Button className="btn-primary self-center" onClick={closeModal}>
          Awesome!
        </Button>
      ) : (
        <LoginButtons />
      )}
      <Checkbox
        ref={inputRef}
        name="neverShow"
        className="self-center mt-6 mb-7"
      >
        Never show this popup again
      </Checkbox>
    </ResponsiveModal>
  );
}
