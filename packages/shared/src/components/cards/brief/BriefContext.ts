import { createContextProvider } from '@kickass-coderz/react';
import type { Dispatch, SetStateAction } from 'react';
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
      `brief_card_${user.id}_v2`,
      undefined,
    );

    return {
      brief,
      setBrief,
    };
  },
);

export { BriefContextProvider, useBriefContext };
