import type { Dispatch, FC, SetStateAction } from 'react';
import React from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import type { Post } from '../../../graphql/posts';
import { usePersistentState } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';

type BriefContext = {
  brief?: Pick<Post, 'id'> & {
    createdAt: Date;
  };
  setBrief: Dispatch<SetStateAction<BriefContext['brief']>>;
};

const [BriefContextProvider, useBriefContext] = createContextProvider(
  (): BriefContext => {
    const { user } = useAuthContext();

    const [brief, setBrief] = usePersistentState<BriefContext['brief']>(
      `brief_card_${user.id}_v3`,
      undefined,
    );

    return {
      brief,
      setBrief,
    };
  },
);

function withBriefContext<T>(Component: FC<T>) {
  return function WithBriefContextComponent(props: T) {
    return (
      <BriefContextProvider>
        <Component {...props} />
      </BriefContextProvider>
    );
  };
}

export { BriefContextProvider, useBriefContext, withBriefContext };
