import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React from 'react';
import { PageContainer, SharedFeedPage } from './utilities';
import { cloudinaryCharmNotEnoughTags } from '../lib/image';
import {
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
  SearchControlHeader,
} from './layout/common';
import usePersistentContext from '../hooks/usePersistentContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from './typography/Typography';

type CustomFeedEmptyScreenProps = {
  chips?: ReactNode;
};

export const CustomFeedEmptyScreen = ({
  chips,
}: CustomFeedEmptyScreenProps = {}): ReactElement => {
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

  return (
    <div className="flex w-full flex-col">
      <div className="mt-0 flex w-full gap-3 tablet:mt-2">
        <SearchControlHeader
          algoState={algoState}
          feedName={SharedFeedPage.Custom}
          chips={chips}
        />
      </div>
      <PageContainer className="mx-auto">
        <div className="mt-16 flex max-h-full w-full max-w-screen-tablet flex-col items-center justify-center gap-4 px-6 text-center">
          <img
            className="h-40 w-40 object-contain"
            src={cloudinaryCharmNotEnoughTags}
            alt="daily.dev charm holding tags"
          />
          <Typography
            type={TypographyType.Title1}
            color={TypographyColor.Primary}
            bold
          >
            Your feed filters are too specific.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            We couldn&apos;t fetch enough posts based on your selected tags. Try
            adding more tags using the feed settings.
          </Typography>
        </div>
      </PageContainer>
    </div>
  );
};
