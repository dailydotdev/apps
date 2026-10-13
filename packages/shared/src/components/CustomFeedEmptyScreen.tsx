import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { SharedFeedPage } from './utilities/common';
import { cloudinaryCharmNotEnoughTags } from '../lib/image';
import { webappUrl } from '../lib/constants';
import {
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
  SearchControlHeader,
} from './layout/common';
import usePersistentContext from '../hooks/usePersistentContext';
import { useLayoutVariant } from '../hooks/layout/useLayoutVariant';
import { useAuthContext } from '../contexts/AuthContext';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from './charm/CharmEmptyState';

type CustomFeedEmptyScreenProps = {
  chips?: ReactNode;
};

export const CustomFeedEmptyScreen = ({
  chips,
}: CustomFeedEmptyScreenProps = {}): ReactElement => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  const setSelectedAlgoState: Dispatch<SetStateAction<number>> = (value) => {
    const nextValue = typeof value === 'function' ? value(selectedAlgo) : value;
    return setSelectedAlgo(nextValue);
  };
  const algoState: [number, Dispatch<SetStateAction<number>>] = [
    selectedAlgo,
    setSelectedAlgoState,
  ];
  // In v2, MainFeedLayout hoists the SearchControlHeader into the page-header
  // strip outside the feed, so rendering it here too would duplicate it.
  const { isV2 } = useLayoutVariant();
  const feedId = (router?.query?.slugOrId as string) || user?.defaultFeedId;

  return (
    <div className="flex w-full flex-col">
      {!isV2 && (
        <div className="mt-0 flex w-full gap-3 tablet:mt-2">
          <SearchControlHeader
            algoState={algoState}
            feedName={SharedFeedPage.Custom}
            chips={chips}
          />
        </div>
      )}
      <CharmEmptyState
        placement={CharmEmptyStatePlacement.Page}
        image={cloudinaryCharmNotEnoughTags}
        imageAlt="daily.dev charm holding tags"
        title="Your feed filters are too specific"
        description="Not enough posts match this feed's filters yet. Loosen them and it fills up."
        action={
          feedId
            ? {
                label: 'Feed settings',
                href: `${webappUrl}feeds/${feedId}/edit`,
              }
            : undefined
        }
      />
    </div>
  );
};
