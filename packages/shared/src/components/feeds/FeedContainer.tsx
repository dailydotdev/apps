import classNames from "classnames";
import { CSSProperties, ReactNode, useContext } from "react";
import { Spaciness } from "../../graphql/settings";
import SettingsContext from "../../contexts/SettingsContext";
import FeedContext from "../../contexts/FeedContext";
import ScrollToTopButton from "../ScrollToTopButton";
import styles from './../Feed.module.css';

export interface FeedContainerProps {
  /**
   * The content of the container.
   */
  children: ReactNode;
  forceCardMode?: boolean;
  header?: ReactNode;
}

export const FeedContainer = ({
  children,
  forceCardMode,
  header,
} : FeedContainerProps) => {
  const currentSettings = useContext(FeedContext);
  const {
    openNewTab,
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
  const getStyle = (useList: boolean, spaciness: Spaciness): CSSProperties => {
    if (useList && spaciness !== 'eco') {
      return spaciness === 'cozy'
        ? { maxWidth: '48.75rem' }
        : { maxWidth: '63.75rem' };
    }
    return {};
  };
  const gapClass = (useList: boolean, spaciness: Spaciness) => useList ? listGaps[spaciness] ?? 'gap-2' : gridGaps[spaciness] ?? 'gap-8';
  const cardClass = (useList: boolean, numCards: number): string => useList ? 'grid-cols-1' : cardListClass[numCards];
  const feedGapPx = getFeedGapPx[gapClass(useList, spaciness)];
  const cardContainerStye = { ...getStyle(useList, spaciness) };
  const style = {
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
  } as CSSProperties;

  return (
    <div
      className={classNames(
        'flex flex-col laptopL:mx-auto w-full',
        styles.container,
      )}
      style={style}
    >
      {header}

      <div
        className={classNames(
          'relative mx-auto w-full',
          styles.feed,
          !useList && styles.cards,
        )}
        style={cardContainerStye}
      >
        <ScrollToTopButton />

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
  )
}