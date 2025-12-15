import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Autocomplete from '../fields/Autocomplete';
import type { TLocation } from '../../graphql/autocomplete';
import { getAutocompleteLocations } from '../../graphql/autocomplete';
import { Radio } from '../fields/Radio';
import { LocationType } from '../../features/opportunity/protobuf/util';
import { locationToString } from '../../lib/utils';
import { generateQueryKey, RequestKey } from '../../lib/query';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type ProfileLocationProps = {
  locationName: string;
  typeName?: string;
  defaultValue?: TLocation & { type?: number };
};

const ProfileLocation = ({
  locationName,
  typeName,
  defaultValue,
}: ProfileLocationProps) => {
  const { user } = useAuthContext();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const [locQuery, setLocQuery] = React.useState('');
  const selectedLoc = watch(locationName);
  const typeValue = watch(typeName || '', defaultValue?.type);

  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.Autocomplete,
      user,
      'location',
      locQuery,
    ),
    queryFn: () => getAutocompleteLocations(locQuery),
    enabled: !!locQuery,
  });
  const handleSearch = (query: string) => {
    setLocQuery(query);
  };
  const [debouncedQuery] = useDebounceFn<string>((q) => handleSearch(q), 300);

  const handleSelect = (val: string) => {
    setValue(locationName, val);
  };

  const locationTypeOptions = [
    { label: 'Remote', value: LocationType.REMOTE },
    { label: 'Hybrid', value: LocationType.HYBRID },
    { label: 'On-site', value: LocationType.OFFICE },
  ];

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        defaultValue={locationToString(defaultValue)}
        label="Location"
        options={
          data?.map((loc) => ({
            label: locationToString(loc),
            value: loc.id,
          })) || []
        }
        selectedValue={selectedLoc}
        name={locationName}
        onSelect={(val) => handleSelect(val)}
        onChange={(val) => debouncedQuery(val)}
        isLoading={isLoading}
      />
      {typeName && (
        <Radio
          className={{
            container: '!flex-row',
          }}
          name={typeName}
          options={locationTypeOptions}
          value={typeValue}
          onChange={(newVal) => setValue(typeName, newVal)}
        />
      )}
      {errors[typeName] && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.StatusError}
        >
          {errors[typeName]?.message as string}
        </Typography>
      )}
    </div>
  );
};

export default ProfileLocation;
