import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patchyConfigQueryOptions } from '../../graphql/patchy';
import { cachePatchyConfig } from './patchyConfig';

// One background fetch of Patchy's config per load, cached for the next one
// (see getPatchyConfig). Only runs while Patchy is on.
export const usePatchyConfigSync = (enabled: boolean): void => {
  const { data } = useQuery({ ...patchyConfigQueryOptions(), enabled });

  useEffect(() => {
    if (data) {
      cachePatchyConfig(data);
    }
  }, [data]);
};
