import React, {
  CSSProperties,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import { RankProgress } from '../RankProgress';
import { RankConfetti } from '../../svg/RankConfetti';
import { rankToColor, RANKS, getRank } from '../../lib/rank';
import { LoggedUser } from '../../lib/user';
import { Checkbox } from '../fields/Checkbox';
import LoginButtons from '../LoginButtons';
import RadialProgress from '../RadialProgress';
import Rank from '../Rank';
import { Button } from '../buttons/Button';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './NewRankModal.module.css';
import GoToDevCardButton from '../GoToDevCardButton';
import useDebounce from '../../hooks/useDebounce';

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
  const [shownRank, setShownRank] = useState(getRank(rank));
  const [shownProgress, setShownProgress] = useState(progress - 1);
  const [animatingRank, setAnimatingRank] = useState(false);
  const [rankAnimationEnded, setRankAnimationEnded] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const timeoutRef = useRef<number>();
  const visibilityRef = useRef(null);

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

  const [animateRank] = useDebounce(() => {
    if (visibilityRef.current) {
      document.removeEventListener('visibilitychange', visibilityRef.current);
    }

    timeoutRef.current = 1000;
    visibilityRef.current = animateRank;

    if (document.visibilityState === 'hidden') {
      document.addEventListener('visibilitychange', visibilityRef.current, {
        once: true,
      });
    } else {
      setAnimatingRank(true);
      setShownRank(rank);
      setShownProgress(RANKS[getRank(rank)].steps);
    }
  }, timeoutRef.current);

  useEffect(() => {
    timeoutRef.current = 1500;
    animateRank();
    return () => {
      if (visibilityRef.current) {
        document.removeEventListener('visibilitychange', visibilityRef.current);
      }
    };
  }, []);

  const [onRankAnimationFinish] = useDebounce(
    () => setRankAnimationEnded(true),
    700,
  );

  return (
    <ResponsiveModal
      onRequestClose={closeModal}
      className={classNames(styles.newRankModal, className)}
      style={{
        content: {
          ...style?.content,
          '--rank-color': rankToColor(rank),
        } as CSSProperties,
        // stylelint-disable-next-line property-no-unknown
        overlay: style?.overlay,
      }}
      {...props}
    >
      <ModalCloseButton onClick={closeModal} />
      <div
        className={`${styles.rankProgressContainer} relative flex items-center justify-center mt-6 z-0`}
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
              progress={RANKS[getRank(rank)].steps}
              steps={RANKS[getRank(rank)].steps}
              className={styles.radialProgress}
            />
            <img
              className={`${styles.profileImage} absolute inset-0 object-cover m-auto rounded-full`}
              src={user.image}
              alt="Your profile"
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
                '--fill-color': rank <= RANKS.length && 'var(--rank-color)',
              } as CSSProperties
            }
          />
        </CSSTransition>
      </div>
      <h1 className="mt-2 font-bold text-center typo-callout">{title}</h1>
      <p className="mt-1 mb-8 text-center text-theme-label-secondary typo-callout">
        You earned the {RANKS[getRank(rank)].name?.toLowerCase()} rank
        {!user && (
          <>
            <br />
            <br />
            Add your new rank to your profile by signing up
          </>
        )}
      </p>
      {user ? (
        <div className="flex gap-4 self-center">
          <GoToDevCardButton>Generate Dev Card</GoToDevCardButton>
          <Button
            className="btn-primary"
            buttonSize="small"
            onClick={closeModal}
          >
            Awesome!
          </Button>
        </div>
      ) : (
        <LoginButtons />
      )}
      <Checkbox
        ref={inputRef}
        name="neverShow"
        className="self-center mt-4 mb-7"
      >
        Never show this popup again
      </Checkbox>
    </ResponsiveModal>
  );
}
