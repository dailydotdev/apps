import { createContextProvider } from '@kickass-coderz/react';
import { useMemo, useState } from 'react';
import type { TIME_OPTIONS } from '../../components/search/common';

type TimeOption = (typeof TIME_OPTIONS)[number];
const [SearchProvider, useSearchContextProvider] = createContextProvider(() => {
  const [time, setTime] = useState<TimeOption>('All time');
  const [postTypes, setPostTypes] = useState<Record<string, boolean>>({});

  const contentCurationFilter = useMemo(
    () => Object.keys(postTypes).filter((key) => postTypes[key] === true),
    [postTypes],
  );

  return { time, setTime, postTypes, setPostTypes, contentCurationFilter };
});
export { SearchProvider, useSearchContextProvider };
