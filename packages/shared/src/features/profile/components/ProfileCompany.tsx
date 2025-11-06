import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Autocomplete from '../../../components/fields/Autocomplete';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getAutocompleteCompanies } from '../../../graphql/autocomplete';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Company } from '../../../lib/userCompany';
import useDebounceFn from '../../../hooks/useDebounceFn';

type ProfileCompanyProps = {
  name: string;
  defaultValue?: Company;
};

const ProfileCompany = ({ name, defaultValue }: ProfileCompanyProps) => {
  const { user } = useAuthContext();
  const { setValue, watch } = useFormContext();
  const [companyQuery, setCompanyQuery] = useState('');
  const selectedCompany = watch(name);
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.Autocomplete,
      user,
      'company',
      companyQuery,
    ),
    queryFn: () => getAutocompleteCompanies(companyQuery),
    enabled: !!companyQuery,
  });
  const [debouncedQuery] = useDebounceFn<string>(
    (q) => setCompanyQuery(q),
    300,
  );

  return (
    <Autocomplete
      name={name}
      onChange={(value) => debouncedQuery(value)}
      onSelect={(value) => setValue(name, value)}
      options={[]}
      defaultValue={defaultValue?.id}
      label="Company"
      isLoading={isLoading}
      resetOnBlur={false}
    />
  );
};

export default ProfileCompany;
