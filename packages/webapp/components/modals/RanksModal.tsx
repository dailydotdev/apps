import React, { CSSProperties, ReactElement } from 'react';
import RankProgress from '../RankProgress';
import { headerRankHeight } from '../../styles/sizes';
import sizeN from '../../macros/sizeN.macro';
import rem from '../../macros/rem.macro';
import styled from '@emotion/styled';
import { RANK_NAMES, STEPS_PER_RANK } from '../../lib/rank';
import Rank from '../Rank';
import {
  Button,
  ModalCloseButton,
  ModalProps,
  ResponsiveModal,
  responsiveModalBreakpoint,
} from '@dailydotdev/shared';
import classNames from 'classnames';
import styles from '../../styles/ranksModal.module.css';

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

const RankProgressContainer = styled.div`
  display: flex;
  width: ${headerRankHeight};
  height: ${headerRankHeight};
  margin-top: ${sizeN(2)};
  align-items: center;
  justify-content: center;
  border-radius: 100%;

  ${responsiveModalBreakpoint} {
    position: absolute;
    left: 0;
    right: 0;
    top: -${rem(1)};
    background: var(--theme-background-primary);
    margin: 0 auto;
    transform: translateY(-50%);
    z-index: 1;
  }
`;

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
}

export default function RanksModal({
  rank,
  progress,
  hideProgress,
  confirmationText,
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
        <RankProgressContainer>
          <RankProgress rank={rank} progress={progress} fillByDefault />
        </RankProgressContainer>
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
      <Button className="btn-primary m-8" onClick={onRequestClose}>
        {confirmationText || `Ok, let’s do it`}
      </Button>
    </ResponsiveModal>
  );
}
