import { createContextProvider } from '@kickass-coderz/react';
import type { PropsWithChildren } from 'react';

type FeedCardContextData = {
  isBoostedReach: boolean;
};

const [FeedCardContextProvider, useFeedCardContext] = createContextProvider(
  ({ isBoostedReach }: PropsWithChildren<FeedCardContextData>) => ({
    isBoostedReach,
  }),
);

export { FeedCardContextProvider, useFeedCardContext };
