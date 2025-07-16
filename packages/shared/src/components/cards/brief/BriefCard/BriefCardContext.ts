import { createContextProvider } from '@kickass-coderz/react';
import type { Dispatch, SetStateAction } from 'react';
import type { Post } from '../../../../graphql/posts';
import usePersistentState from '../../../../hooks/usePersistentState';

type BriefCardContext = {
  brief?: Pick<Post, 'id'> & {
    createdAt: Date;
  };
  setBrief: Dispatch<SetStateAction<BriefCardContext['brief']>>;
};

const [BriefCardContextProvider, useBriefCardContext] = createContextProvider(
  (): BriefCardContext => {
    const [brief, setBrief] = usePersistentState<BriefCardContext['brief']>(
      'brief_card_v2',
      undefined,
    );

    return {
      brief,
      setBrief,
    };
  },
);

export { BriefCardContextProvider, useBriefCardContext };
