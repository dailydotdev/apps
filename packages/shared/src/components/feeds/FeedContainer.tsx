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
  // TODO: Ask about this - currentSettings numCards is 1?
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  // const numCards = 2;
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

  console.log('currentSettings', currentSettings)

  return (
    <div
      className={classNames(
        'here1 flex flex-col laptopL:mx-auto w-full',
        styles.container,
      )}
    >
      <ScrollToTopButton />

      <div className="flex flex-col laptopL:mx-auto w-full Feed_container__nHOSZ px-6 laptop:px-0 pt-14 laptop:pt-10" style={style}>
        <div className="relative mx-auto w-full Feed_feed__uPgJj Feed_cards__wRg8A">
          {header}

          <div className="grid gap-8 grid-cols-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}