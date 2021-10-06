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
    <div className="font-bold capitalize typo-callout">{rankName} level</div>
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

function DevCardFooter({
  rank,
  reads,
  devCardLimit,
}: Pick<RanksModalProps, 'rank' | 'reads' | 'devCardLimit'>): ReactElement {
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
        className="self-start mt-4 btn-primary"
        onClick={() => showLogin('ranks instructions')}
      >
        Sign in
      </Button>
    );
  } else if (devCardLimit && !reachedLimit) {
    devCardText = `To generate a personal dev card you must read at least ${devCardLimit} articles`;
    devCardCTA = (
      <div className="flex items-center mt-2">
        <div className="font-bold typo-subhead">{`${reads}/${devCardLimit}`}</div>
        <div className="overflow-hidden flex-1 ml-2 h-1 bg-theme-active rounded-2">
          <div
            className="h-full rounded-2 bg-theme-label-primary"
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
        className="self-start mt-4"
      >
        Generate
      </GoToDevCardButton>
    );
  }
  return (
    <>
      <div className="-mx-2 mt-8 mb-5 w-full h-px bg-theme-divider-tertiary" />
      <div className="flex items-start self-stretch px-4 mb-6">
        <DevCardPlaceholder profileImage={user?.image} width={44} rank={rank} />
        <div className="flex flex-col flex-1 ml-4">
          <div className="font-bold typo-callout">Your Dev Card</div>
          <div className="mt-0.5 text-theme-label-tertiary typo-footnote">
            {devCardText}
          </div>
          {devCardCTA}
        </div>
      </div>
    </>
  );
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
      <h1 className="mt-4 mobileL:mt-11 font-bold uppercase typo-title2">
        Your weekly goal
      </h1>
      <h2 className="mt-1 font-normal text-theme-label-secondary typo-callout">
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
      {!hideProgress && (
        <DevCardFooter rank={rank} reads={reads} devCardLimit={devCardLimit} />
      )}
    </ResponsiveModal>
  );
}
