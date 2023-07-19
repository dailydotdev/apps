import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import classNames from 'classnames';
import { Spaciness } from '../../graphql/settings';
import SettingsContext from '../../contexts/SettingsContext';
import FeedContext from '../../contexts/FeedContext';
import ScrollToTopButton from '../ScrollToTopButton';
import styles from '../Feed.module.css';

/**
 * Props for the FeedContainer component.
 */
export interface FeedContainerProps {
  children: ReactNode;
  forceCardMode?: boolean;
  header?: ReactNode;
}

export const FeedContainer = ({
  children,
  forceCardMode,
  header,
}: FeedContainerProps): ReactElement => {
  const currentSettings = useContext(FeedContext);
  const {
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const insaneMode = !forceCardMode && listMode;
  const useList = insaneMode && numCards > 1;
  const listGaps = {
    cozy: 'gap-5',
    roomy: 'gap-3',
  };
  const gridGaps = {
    cozy: 'gap-14',
    roomy: 'gap-12',
  };
  const cardListClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
  };
  const getFeedGapPx = {
    'gap-2': 8,
    'gap-3': 12,
    'gap-5': 20,
    'gap-8': 32,
    'gap-12': 48,
    'gap-14': 56,
  };
  const gapClass = (isList: boolean, space: Spaciness) =>
    isList ? listGaps[space] ?? 'gap-2' : gridGaps[space] ?? 'gap-8';
  const cardClass = (isList: boolean, numberOfCards: number): string =>
    isList ? 'grid-cols-1' : cardListClass[numberOfCards];
  const feedGapPx = getFeedGapPx[gapClass(useList, spaciness)];
  const style = {
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;

  if (!loadedSettings) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        'flex flex-col laptopL:mx-auto w-full Feed_container__nHOSZ',
        styles.container,
      )}
    >
      <ScrollToTopButton />

      <div
        className="flex flex-col px-6 laptop:px-0 pt-2 laptopL:mx-auto w-full"
        style={style}
      >
        <div className="relative mx-auto w-full Feed_feed__uPgJj Feed_cards__wRg8A">
          {header}

          <div
            className={classNames(
              'grid',
              gapClass(useList, spaciness),
              cardClass(useList, numCards),
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
