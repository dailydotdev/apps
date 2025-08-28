import { createContextProvider } from '@kickass-coderz/react';
import type { Dispatch, SetStateAction } from 'react';
import type { Post } from '../../../../graphql/posts';
import { usePersistentState } from '../../../../hooks';
import { useAuthContext } from '../../../../contexts/AuthContext';

type BriefCardContext = {
  brief?: Pick<Post, 'id'> & {
    createdAt: Date;
  };
  setBrief: Dispatch<SetStateAction<BriefCardContext['brief']>>;
};

const [BriefCardContextProvider, useBriefCardContext] = createContextProvider(
  (): BriefCardContext => {
    const { user } = useAuthContext();

    const [brief, setBrief] = usePersistentState<BriefCardContext['brief']>(
      `brief_card_${user.id}_v2`,
      undefined,
    );

    return {
      brief,
      setBrief,
    };
  },
);

export { BriefCardContextProvider, useBriefCardContext };
