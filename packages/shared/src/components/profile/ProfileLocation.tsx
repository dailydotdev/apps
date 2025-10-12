import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Autocomplete from '../fields/Autocomplete';
import type { Location } from '../../graphql/autocomplete';
import { getAutocompleteLocations } from '../../graphql/autocomplete';
import { Radio } from '../fields/Radio';

type ProfileLocationProps = {
  locationName: string;
  typeName?: string;
};
const typeOptions = [
  { label: 'Remote', value: 'remote' },
  { label: 'On-site', value: 'on-site' },
  { label: 'Hybrid', value: 'hybrid' },
];

const LocationToString = (loc: Location) => {
  return `${loc.city}, ${loc.subdivision ? `${loc.subdivision}, ` : ''}${
    loc.country
  }`;
};

const ProfileLocation = ({ locationName, typeName }: ProfileLocationProps) => {
  const { setValue, watch } = useFormContext();
  const [locQuery, setLocQuery] = React.useState('');
  const selectedLoc = watch(locationName);
  const typeValue = watch(typeName || '');
  const { data, isLoading } = useQuery({
    queryKey: ['location', locQuery],
    queryFn: () => getAutocompleteLocations(locQuery),
    enabled: !!locQuery,
  });
  const handleSearch = (query: string) => {
    setLocQuery(query);
  };

  const handleSelect = (val: string) => {
    setValue(locationName, val);
  };

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        label="Location"
        options={
          data?.map((loc) => ({
            label: LocationToString(loc),
            value: loc.id,
          })) || []
        }
        selectedValue={selectedLoc}
        name={locationName}
        onSelect={(val) => handleSelect(val)}
        onChange={(val) => handleSearch(val)}
        isLoading={isLoading}
      />
      {typeName && (
        <Radio
          className={{
            container: '!flex-row',
          }}
          name={typeName}
          options={typeOptions}
          value={typeValue}
          onChange={(newVal) => setValue(typeName, newVal)}
        />
      )}
    </div>
  );
};

export default ProfileLocation;
