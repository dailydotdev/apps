import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import classNames from 'classnames';
import { RankProgress } from '../RankProgress';
import { RANK_NAMES, STEPS_PER_RANK } from '../../lib/rank';
import Rank from '../Rank';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import styles from './RanksModal.module.css';
import DevCardPlaceholder from '../DevCardPlaceholder';
import AuthContext from '../../contexts/AuthContext';
import GoToDevCardButton from '../GoToDevCardButton';
import { Button } from '../buttons/Button';

const RankItem = ({
  rank,
  steps,
  completed,
  current,
  rankName,
}: {
  rank: number;
  steps: number;
  completed: boolean;
  current: boolean;
  rankName: string;
}): ReactElement => (
  <li
    className={classNames(
      'grid h-16 auto-rows-max items-center content-center px-4 rounded-2xl border select-none',
      current && 'shadow-2 bg-theme-bg-secondary',
    )}
    style={{
      gridTemplateColumns: 'max-content 1fr',
      gridColumnGap: '1rem',
      gridRowGap: '0.125rem',
      borderColor: current ? 'var(--theme-divider-tertiary)' : 'transparent',
    }}
  >
    <Rank
      rank={rank}
      colorByRank={completed}
      className="row-span-2"
      style={
        {
          '--stop-color1': 'var(--theme-label-disabled)',
          '--stop-color2': 'var(--theme-label-disabled)',
        } as CSSProperties
      }
    />
    <div className="capitalize font-bold typo-callout">{rankName} level</div>
    <div className="text-theme-label-tertiary typo-footnote">
      Read at least 1 article on {steps} different days
    </div>
  </li>
);

const ranksMetadata = STEPS_PER_RANK.map((steps, index) => ({
  rank: index + 1,
  name: RANK_NAMES[index],
  steps,
}));

export interface RanksModalProps extends ModalProps {
  rank: number;
  progress: number;
  hideProgress?: boolean;
  confirmationText?: string;
  reads: number;
  devCardLimit: number;
}

export default function RanksModal({
  rank,
  progress,
  hideProgress,
  confirmationText,
  reads,
  devCardLimit,
  onRequestClose,
  className,
  ...props
}: RanksModalProps): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const reachedLimit = devCardLimit && reads >= devCardLimit;
  let devCardText: string;
  let devCardCTA: ReactNode;
  if (!user) {
    if (devCardLimit && !reachedLimit) {
      devCardText = `To generate a personal dev card you must read at least ${devCardLimit} articles and sign in`;
    } else {
      devCardText = 'To generate a personal dev card you must sign in';
    }
    devCardCTA = (
      <Button
        className="btn-primary mt-4 self-start"
        onClick={() => showLogin('ranks instructions')}
      >
        Sign in
      </Button>
    );
  } else if (devCardLimit && !reachedLimit) {
    devCardText = `To generate a personal dev card you must read at least ${devCardLimit} articles`;
    devCardCTA = (
      <div className="mt-2 flex items-center">
        <div className="typo-subhead font-bold">{`${reads}/${devCardLimit}`}</div>
        <div className="ml-2 flex-1 h-1 rounded-2 bg-theme-active overflow-hidden">
          <div
            className="bg-theme-label-primary h-full rounded-2"
            style={{ width: `${(reads * 100) / devCardLimit}%` }}
          />
        </div>
      </div>
    );
  } else {
    devCardText =
      'Generate a personal dev card to show the world the topics you love';
    devCardCTA = (
      <GoToDevCardButton
        origin="ranks instructions"
        className="mt-4 self-start"
      >
        Generate
      </GoToDevCardButton>
    );
  }

  return (
    <ResponsiveModal
      {...props}
      onRequestClose={onRequestClose}
      className={classNames(styles.ranksModal, className)}
    >
      <ModalCloseButton onClick={onRequestClose} />
      {!hideProgress && (
        <div
          className={`${styles.rankProgress} flex mt-2 items-center justify-center rounded-full responsiveModalBreakpoint:absolute responsiveModalBreakpoint:left-0 responsiveModalBreakpoint:right-0 responsiveModalBreakpoint:-top-px responsiveModalBreakpoint:bg-theme-bg-primary responsiveModalBreakpoint:my-0 responsiveModalBreakpoint:mx-auto responsiveModalBreakpoint:transform responsiveModalBreakpoint:-translate-y-1/2 responsiveModalBreakpoint:z-1`}
        >
          <RankProgress rank={rank} progress={progress} fillByDefault />
        </div>
      )}
      <h1 className="mt-4 uppercase font-bold typo-title2 mobileL:mt-11">
        Your weekly goal
      </h1>
      <h2 className="mt-1 text-theme-label-secondary font-normal typo-callout">
        Read content you love to stay updated
      </h2>
      <ul className="flex flex-col self-stretch mt-4">
        {ranksMetadata.map((meta) => (
          <RankItem
            key={meta.rank}
            rank={meta.rank}
            completed={meta.rank <= rank}
            current={meta.rank === rank}
            rankName={meta.name}
            steps={meta.steps}
          />
        ))}
      </ul>
      <div className="h-px w-full bg-theme-divider-tertiary mt-8 mb-5 -mx-2" />
      <div className="flex px-4 mb-6 self-stretch items-start">
        <DevCardPlaceholder profileImage={user?.image} width={44} rank={rank} />
        <div className="flex flex-col ml-4 flex-1">
          <div className="font-bold typo-callout">Your Dev Card</div>
          <div className="text-theme-label-tertiary typo-footnote mt-0.5">
            {devCardText}
          </div>
          {devCardCTA}
        </div>
      </div>
    </ResponsiveModal>
  );
}
