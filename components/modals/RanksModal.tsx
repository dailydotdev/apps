/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { ReactElement } from 'react';
import { ModalCloseButton, Props as ModalProps } from './StyledModal';
import ResponsiveModal, { responsiveModalBreakpoint } from './ResponsiveModal';
import RankProgress from '../RankProgress';
import {
  headerHeight,
  headerRankHeight,
  size05,
  size1,
  size1px,
  size2,
  size4,
  size8,
  sizeN,
} from '../../styles/sizes';
import styled from '@emotion/styled';
import { typoCallout, typoFootnote, typoTitle2 } from '../../styles/typography';
import { RANK_NAMES, STEPS_PER_RANK } from '../../lib/rank';
import Rank from '../Rank';
import PrimaryButton from '../buttons/PrimaryButton';

const Title = styled.h1`
  margin: ${size4} 0 0;
  text-transform: uppercase;
  font-weight: bold;
  ${typoTitle2}

  ${responsiveModalBreakpoint} {
    margin-top: ${sizeN(11)};
  }
`;

const Subtitle = styled.h2`
  margin: ${size1} 0 0;
  color: var(--theme-label-secondary);
  font-weight: normal;
  ${typoCallout}
`;

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
    css={css`
      display: grid;
      height: ${sizeN(16)};
      grid-template-columns: max-content 1fr;
      grid-auto-rows: max-content;
      grid-column-gap: ${size4};
      grid-row-gap: ${size05};
      align-items: center;
      align-content: center;
      padding: 0 ${size4};
      border-radius: ${size4};
      border: ${size1px} solid transparent;
      user-select: none;

      ${current &&
      `
        background: var(--theme-background-secondary);
        border-color: var(--theme-divider-tertiary);
        box-shadow: var(--theme-shadow2);
      `}
    `}
  >
    <Rank
      rank={rank}
      colorByRank={completed}
      css={css`
        grid-row: span 2;
        --stop-color1: var(--theme-label-disabled);
        --stop-color2: var(--theme-label-disabled);
      `}
    />
    <div
      css={css`
        text-transform: capitalize;
        font-weight: bold;
        ${typoCallout}
      `}
    >
      {rankName} level
    </div>
    <div
      css={css`
        color: var(--theme-label-tertiary);
        ${typoFootnote}
      `}
    >
      Read at least 1 article on {steps} different days
    </div>
  </li>
);

const RankProgressContainer = styled.div`
  display: flex;
  width: ${headerRankHeight};
  height: ${headerRankHeight};
  margin-top: ${size2};
  align-items: center;
  justify-content: center;
  border-radius: 100%;

  ${responsiveModalBreakpoint} {
    position: absolute;
    left: 0;
    right: 0;
    top: -${size1px};
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
}

export default function RanksModal({
  rank,
  progress,
  onRequestClose,
  ...props
}: RanksModalProps): ReactElement {
  return (
    <ResponsiveModal
      onRequestClose={onRequestClose}
      {...props}
      css={css`
        .Modal {
          align-items: center;
          max-width: ${sizeN(105)};
        }

        ${responsiveModalBreakpoint} {
          .Overlay {
            justify-content: flex-start;
          }

          .Modal {
            margin-top: ${headerHeight};
            overflow: visible;
          }
        }
      `}
    >
      <ModalCloseButton onClick={onRequestClose} />
      <RankProgressContainer>
        <RankProgress rank={rank} progress={progress} fillByDefault />
      </RankProgressContainer>
      <Title>Your weekly goal</Title>
      <Subtitle>Read content you love to stay updated</Subtitle>
      <ul
        css={css`
          display: flex;
          flex-direction: column;
          align-self: stretch;
          margin: ${size4} 0 0;
          padding: 0;
        `}
      >
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
      <PrimaryButton
        onClick={onRequestClose}
        css={css`
          margin: ${size8};
        `}
      >
        Ok, let’s do it
      </PrimaryButton>
    </ResponsiveModal>
  );
}
