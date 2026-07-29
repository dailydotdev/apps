import type { Dispatch, FC, SetStateAction } from 'react';
import React, { useMemo } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import type { Post } from '../../../graphql/posts';
import { usePersistentState } from '../../../hooks';
import { useAuthContext } from '../../../contexts/AuthContext';
import { oneHour } from '../../../lib/dateFormat';

type BriefContext = {
  brief?: Pick<Post, 'id'> & {
    createdAt: Date;
  };
  setBrief: Dispatch<SetStateAction<BriefContext['brief']>>;
};

const briefStaleMs = 4 * oneHour * 1000;

const [BriefContextProvider, useBriefContext] = createContextProvider(
  (): BriefContext => {
    const { user } = useAuthContext();

    const [storedBrief, setBrief] = usePersistentState<BriefContext['brief']>(
      `brief_card_${user.id}_v6`,
      undefined,
    );

    const brief = useMemo(() => {
      if (!storedBrief) {
        return undefined;
      }

      const createdAt = new Date(storedBrief.createdAt);

      if (Date.now() - createdAt.getTime() > briefStaleMs) {
        return undefined;
      }

      return storedBrief;
    }, [storedBrief]);

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
