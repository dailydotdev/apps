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
import { ClickableText } from '../buttons/ClickableText';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { useTrackModal } from '../../hooks/useTrackModal';
import RadialProgress from '../RadialProgress';
import styles2 from '../RankProgress.module.css';

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
  onShowAccount?: () => void;
}

function DevCardFooter({
  rank,
  reads,
  devCardLimit,
}: Pick<RanksModalProps, 'rank' | 'reads' | 'devCardLimit'>): ReactElement {
  const { user } = useContext(AuthContext);

  return (
    <>
      <section className="flex flex-col p-6 mb-4">
        <strong className="typo-headline mb-2">Generate your DevCard</strong>
        <div className="mt-2 flex">
          <DevCardPlaceholder
            profileImage={user?.image}
            height={80}
            rank={rank}
          />
          <div className="ml-6 flex flex-col flex-1 items-start">
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

  // Todo: Refactor these to load from API
  const tags = [
    { title: 'general-programming', count: 0 },
    { title: 'carreer', count: 1 },
    { title: 'startup', count: 2 },
    { title: 'productivity', count: 3 },
    { title: 'webdev', count: 4 },
    { title: 'javascript', count: 5 },
    { title: 'css', count: 6 },
    { title: 'tailwind-css', count: 7 },
  ].reverse();

  const ranks = [
    {
      name: 'Starter',
      steps: 0,
      level: 1,
      color: 'red',
    },
    {
      name: 'Bronze',
      steps: 0,
      level: 2,
      color: 'red',
    },
    {
      name: 'Silver',
      level: 3,
      color: 'red',
    },
    {
      name: 'Gold',
      level: 4,
      color: 'red',
    },
    {
      name: 'Platinum',
      level: 5,
      color: 'red',
    },
    {
      name: 'Diamond',
      level: 6,
      color: 'red',
    },
    {
      name: 'Legendary',
      level: 7,
      color: 'red',
    },
  ];

  const currentRank = 1;

  const getRankOffset = {
    0: '37.5%',
    1: '37.5%',
    2: '12.5%',
    3: '-12.5%',
    4: '-37.5%',
    5: '-62.5%',
    6: '-87.5%',
    7: '-112.5%',
  };

  return (
    <ResponsiveModal {...props} onRequestClose={onRequestClose} padding={false}>
      <header className="py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">Weekly reading goal</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section className="flex flex-col p-6 mb-4">
        <strong className="typo-headline mb-2">Reading status</strong>
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
      <section className="overflow-hidden">
        <ul
          className="flex flex-nowrap"
          style={{
            transform: `translate(${getRankOffset[currentRank]})`,
          }}
        >
          {ranks.map((rank, i) => (
            <li className="flex flex-col items-center justify-center w-1/4 relative">
              {rank.level !== ranks.length && (
                <div
                  className="absolute w-3/4 h-px bg-white"
                  style={{ top: '35%', left: '60%' }}
                />
              )}
              <div
                className={classNames(
                  'flex justify-center items-center relative bg-theme-bg-tertiary',
                  currentRank === i + 1
                    ? 'w-16 h-16'
                    : 'w-10 h-10 border rounded-12',
                )}
              >
                {currentRank === i + 1 && (
                  <RadialProgress
                    progress={1}
                    steps={rank.level}
                    className={classNames(
                      styles2.radialProgress,
                      'w-full h-full absolute inset-0',
                    )}
                  />
                )}
                <Rank
                  rank={i + 1}
                  className={classNames(
                    currentRank === i + 1 ? 'w-10 h-10' : 'w-8 h-8',
                  )}
                  style={
                    {
                      '--stop-color1': 'var(--theme-label-disabled)',
                      '--stop-color2': 'var(--theme-label-disabled)',
                    } as CSSProperties
                  }
                />
              </div>
              <strong
                className={classNames(
                  'mt-2',
                  currentRank === i + 1 ? 'typo-callout' : 'typo-footnote',
                )}
              >
                {rank.name}
              </strong>
            </li>
          ))}
        </ul>
        <p className="text-center text-theme-label-tertiary typo-footnote mt-1 mb-3">
          Earn: 4/5 reading days
        </p>
      </section>
      <section className="m-4 p-4 mb-0 rounded-16 border bg-theme-secondary border-theme-divider-tertiary">
        <strong className="typo-headline block mb-6">
          Reading status per tag
        </strong>
        <ul className="grid grid-cols-2 grid-rows-4 grid-flow-col gap-4">
          {tags.map((tag) => (
            <li className="flex flex-row items-center">
              <RadialProgress
                progress={tag.count}
                steps={7}
                className={classNames('w-5 h-5', styles2.radialProgress)}
              />
              <strong className="flex flex-shrink h-6 items-center ml-2 w-auto bg-theme-float rounded-8 px-3 typo-callout text-theme-label-tertiary truncate">
                #{tag.title}
              </strong>
            </li>
          ))}
        </ul>
      </section>
      {!hideProgress && (
        <DevCardFooter rank={rank} reads={reads} devCardLimit={devCardLimit} />
      )}
    </ResponsiveModal>
  );

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
      <div className="flex overflow-y-auto flex-col items-center responsiveModalBreakpoint:max-h-rank-modal">
        <h1 className="mt-4 mobileL:mt-11 font-bold uppercase typo-title2">
          Your weekly goal
        </h1>
        <h2 className="mt-1 font-normal text-theme-label-secondary typo-callout">
          Read content you love to stay updated
        </h2>
        <TimezoneText onShowAccount={onShowAccount} />

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
          <DevCardFooter
            rank={rank}
            reads={reads}
            devCardLimit={devCardLimit}
          />
        )}
      </div>
    </ResponsiveModal>
  );
}
