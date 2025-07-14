import { createContextProvider } from '@kickass-coderz/react';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';
import type { Post } from '../../../../graphql/posts';

type BriefCardContext = {
  brief?: Pick<Post, 'id'> & {
    createdAt: Date;
  };
  setBrief: Dispatch<SetStateAction<BriefCardContext['brief']>>;
};

const [BriefCardContextProvider, useBriefCardContext] = createContextProvider(
  (): BriefCardContext => {
    const [brief, setBrief] =
      React.useState<BriefCardContext['brief']>(undefined);

    return {
      brief,
      setBrief,
    };
  },
);

export { BriefCardContextProvider, useBriefCardContext };
