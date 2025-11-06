import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Autocomplete from '../../../components/fields/Autocomplete';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import {
  AutocompleteType,
  getAutocompleteCompanies,
} from '../../../graphql/autocomplete';
import { useAuthContext } from '../../../contexts/AuthContext';
import useDebounceFn from '../../../hooks/useDebounceFn';

type ProfileCompanyProps = {
  name: string;
  label?: string;
  type?: AutocompleteType;
};

const ProfileCompany = ({
  name,
  label = 'Company',
  type = AutocompleteType.Company,
}: ProfileCompanyProps) => {
  const { user } = useAuthContext();
  const { setValue, watch } = useFormContext();
  const customCompanyName = watch(name);
  const companyId = watch('companyId');
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.Autocomplete,
      user,
      'company',
      customCompanyName,
    ),
    queryFn: () => getAutocompleteCompanies(customCompanyName, type),
    enabled: !!customCompanyName,
  });

  const handleSearch = (query: string) => {
    setValue(name, query);
  };

  const handleSelect = (value: string) => {
    const selectedCompany = data?.find((company) => company.id === value);
    if (selectedCompany) {
      setValue('companyId', selectedCompany.id);
    }
  };

  const [debouncedQuery] = useDebounceFn<string>((q) => handleSearch(q), 300);

  return (
    <Autocomplete
      name={name}
      defaultValue={customCompanyName}
      onChange={(value) => debouncedQuery(value)}
      onSelect={(value) => handleSelect(value)}
      options={
        data?.map((company) => ({
          label: company.name,
          value: company.id,
        })) || []
      }
      selectedValue={companyId}
      label={label}
      isLoading={isLoading}
      resetOnBlur={false}
    />
  );
};

export default ProfileCompany;
