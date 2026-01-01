import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useDebounceFn from '../../../hooks/useDebounceFn';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getAutocompleteLocations } from '../../../graphql/autocomplete';
import type { TLocation } from '../../../graphql/autocomplete';

export type UseLocationAutocompleteOptions = {
  debounceMs?: number;
};

export type UseLocationAutocompleteReturn = {
  locationQuery: string;
  locationOptions: TLocation[] | undefined;
  isLoadingLocations: boolean;
  handleLocationSearch: (query: string) => void;
  findLocationById: (id: string) => TLocation | undefined;
};

export const useLocationAutocomplete = (
  options: UseLocationAutocompleteOptions = {},
): UseLocationAutocompleteReturn => {
  const { debounceMs = 300 } = options;
  const [locationQuery, setLocationQuery] = useState('');

  const { data: locationOptions, isLoading: isLoadingLocations } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.Autocomplete,
      null,
      'organization-location',
      locationQuery,
    ),
    queryFn: () => getAutocompleteLocations(locationQuery),
    enabled: !!locationQuery && locationQuery.length > 0,
  });

  const [debouncedLocationSearch] = useDebounceFn<string>((query) => {
    setLocationQuery(query);
  }, debounceMs);

  const findLocationById = (id: string): TLocation | undefined => {
    return locationOptions?.find((loc) => loc.id === id);
  };

  return {
    locationQuery,
    locationOptions,
    isLoadingLocations,
    handleLocationSearch: debouncedLocationSearch,
    findLocationById,
  };
};
