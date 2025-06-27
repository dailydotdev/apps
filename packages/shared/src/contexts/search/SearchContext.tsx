import { createContextProvider } from '@kickass-coderz/react';
import { useMemo, useState } from 'react';
import type { SearchTime } from '../../graphql/search';

type TimeOption = (typeof SearchTime)[number];
const [SearchProvider, useSearchContextProvider] = createContextProvider(() => {
  const [time, setTime] = useState<TimeOption>('AllTime');
  const [postTypes, setPostTypes] = useState<Record<string, boolean>>({});

  const contentCurationFilter = useMemo(
    () => Object.keys(postTypes).filter((key) => postTypes[key] === true),
    [postTypes],
  );

  return { time, setTime, postTypes, setPostTypes, contentCurationFilter };
});
export { SearchProvider, useSearchContextProvider };
