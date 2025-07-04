import { createContextProvider } from '@kickass-coderz/react';
import { useMemo, useState } from 'react';
import type { SearchTime } from '../../graphql/search';

const [SearchProvider, useSearchContextProvider] = createContextProvider(
  () => {
    const [time, setTime] = useState<keyof SearchTime>(
      'AllTime' as keyof SearchTime,
    );
    const [postTypes, setPostTypes] = useState<Record<string, boolean>>({});

    const contentCurationFilter = useMemo(
      () => Object.keys(postTypes).filter((key) => postTypes[key] === true),
      [postTypes],
    );

    return { time, setTime, postTypes, setPostTypes, contentCurationFilter };
  },
  {
    scope: 'SearchContext',
  },
);
export { SearchProvider, useSearchContextProvider };
