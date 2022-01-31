import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { RANKS, RANK_OFFSET } from '../../lib/rank';
import Rank from '../Rank';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalProps } from './StyledModal';
import { ResponsiveModal } from './ResponsiveModal';
import DevCardPlaceholder from '../DevCardPlaceholder';
import AuthContext from '../../contexts/AuthContext';
import GoToDevCardButton from '../GoToDevCardButton';
import { ClickableText } from '../buttons/ClickableText';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useTrackModal } from '../../hooks/useTrackModal';
import RadialProgress from '../RadialProgress';
import styles from '../RankProgress.module.css';
import { ModalSubTitle } from './common';

export interface RanksModalProps extends ModalProps {
  rank: number;
  progress: number;
  hideProgress?: boolean;
  confirmationText?: string;
  reads: number;
  devCardLimit: number;
  onShowAccount?: () => void;
}

type RanksSectionProps = Pick<RanksModalProps, 'rank' | 'progress'>;
const RanksSection = ({ rank, progress }: RanksSectionProps): ReactElement => {
  return (
    <section className="overflow-hidden">
      <ul
        className="flex flex-nowrap"
        style={{
          transform: `translate(${RANK_OFFSET[rank]})`,
        }}
      >
        {RANKS.map((_rank) => (
          <li
            className="flex relative flex-col justify-center items-center w-1/4"
            key={_rank.name}
          >
            {_rank.level !== RANKS.length && (
              <div className="absolute w-3/4 h-px bg-white top-[35%] left-[60%]" />
            )}
            <div
              className={classNames(
                'flex justify-center items-center relative bg-theme-bg-tertiary',
                rank === _rank.level
                  ? 'w-16 h-16'
                  : 'w-10 h-10 border rounded-12',
              )}
            >
              {rank === _rank.level && (
                <RadialProgress
                  progress={progress}
                  steps={_rank.steps}
                  className={classNames(
                    styles.radialProgress,
                    'w-full h-full absolute inset-0',
                  )}
                />
              )}
              <Rank
                rank={_rank.level}
                className={classNames(
                  rank === _rank.level ? 'w-10 h-10' : 'w-8 h-8',
                )}
              />
            </div>
            <strong
              className={classNames(
                'mt-2',
                rank === _rank.level ? 'typo-callout' : 'typo-footnote',
              )}
            >
              {_rank.name}
            </strong>
          </li>
        ))}
      </ul>
      <p className="mt-1 mb-3 text-center text-theme-label-tertiary typo-footnote">
        Earn: 4/5 reading days
      </p>
    </section>
  );
};

interface Tag {
  title: string;
  count: number;
}
interface TagRanksSectionProps {
  tags: Tag[];
}
const TagRanksSection = ({ tags }: TagRanksSectionProps): ReactElement => {
  return (
    <section className="p-4 m-4 mb-0 rounded-16 border bg-theme-bg-secondary border-theme-divider-tertiary">
      <ModalSubTitle>Reading status per tag</ModalSubTitle>
      <ul className="grid grid-cols-2 grid-rows-4 grid-flow-col gap-4 mt-6">
        {tags.map((tag) => (
          <li className="flex flex-row items-center" key={tag.title}>
            <RadialProgress
              progress={tag.count}
              steps={7}
              className={classNames('w-5 h-5', styles.radialProgress)}
            />
            <strong className="flex flex-shrink items-center px-3 ml-2 w-auto h-6 truncate bg-theme-float rounded-8 typo-callout text-theme-label-tertiary">
              #{tag.title}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
};

function DevCardFooter({ rank }: Pick<RanksModalProps, 'rank'>): ReactElement {
  const { user } = useContext(AuthContext);

  return (
    <>
      <section className="flex flex-col p-6 mb-4">
        <ModalSubTitle>Generate your DevCard</ModalSubTitle>
        <div className="flex mt-2">
          <DevCardPlaceholder
            profileImage={user?.image}
            height={80}
            rank={rank}
          />
          <div className="flex flex-col flex-1 items-start ml-6">
            <p className="typo-footnote text-theme-label-tertiary">
              DevCard is your developer ID. It showcases your achievements to
              the world.
            </p>
            <GoToDevCardButton origin="ranks instructions" className="mt-3">
              Generate
            </GoToDevCardButton>
          </div>
        </div>
      </section>
    </>
  );
}

const TimezoneText = ({ onShowAccount }) => {
  const classes =
    'mt-4 mx-10 font-normal text-center  text-theme-label-secondary typo-callout';
  const { user } = useContext(AuthContext);

  const signIn = (
    <p className={classes}>
      To fit the weekly goal to your time zone, please sign up and add it in the
      account details.
    </p>
  );

  const accountDetails = (
    <p className={classes}>
      To fit the weekly goal to your time zone, please add it in your{' '}
      <SimpleTooltip content="Open account details">
        <ClickableText
          tag="a"
          className="inline-flex text-theme-label-link"
          onClick={() => onShowAccount()}
        >
          account details.
        </ClickableText>
      </SimpleTooltip>
    </p>
  );

  const loggedTimezoneDescription = !user?.timezone ? accountDetails : null;
  const timezoneDescription = !user ? signIn : loggedTimezoneDescription;

  return timezoneDescription;
};

export default function RanksModal({
  rank,
  progress,
  hideProgress,
  confirmationText,
  reads,
  devCardLimit,
  onRequestClose,
  onShowAccount,
  className,
  ...props
}: RanksModalProps): ReactElement {
  useTrackModal({ isOpen: props.isOpen, title: 'ranks modal' });
  const currentRank = rank + 1;

  // Todo: Refactor these to load from API
  const tags: Tag[] = [
    { title: 'general-programming', count: 0 },
    { title: 'carreer', count: 1 },
    { title: 'startup', count: 2 },
    { title: 'productivity', count: 3 },
    { title: 'webdev', count: 4 },
    { title: 'javascript', count: 5 },
    { title: 'css', count: 6 },
    { title: 'tailwind-css', count: 7 },
  ].reverse();

  return (
    <ResponsiveModal {...props} onRequestClose={onRequestClose} padding={false}>
      <header className="py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Weekly reading goal</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section className="flex flex-col p-6 mb-4">
        <ModalSubTitle>Reading status</ModalSubTitle>
        <p className="typo-callout text-theme-label-tertiary">
          Read content you love to stay updated.{' '}
          <ClickableText
            tag="a"
            target="_blank"
            href="https://docs.daily.dev/docs/your-profile/weekly-goal"
            rel="noopener"
            className="inline-flex text-theme-label-link"
          >
            Learn more.
          </ClickableText>
        </p>
        <TimezoneText onShowAccount={onShowAccount} />
      </section>
      <RanksSection rank={currentRank} progress={progress} />
      <TagRanksSection tags={tags} />
      {!hideProgress && reads > devCardLimit && <DevCardFooter rank={rank} />}
    </ResponsiveModal>
  );
}
