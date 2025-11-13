import React, { useMemo } from 'react';
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
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../components/typography/Typography';

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
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
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
    if (query === '') {
      setValue('companyId', '');
    }
    setValue(name, query);
  };

  const handleSelect = (value: string) => {
    const selectedCompany = data?.find((company) => company.id === value);
    if (selectedCompany) {
      setValue('companyId', selectedCompany.id);
    }
  };

  const [debouncedQuery] = useDebounceFn<string>((q) => handleSearch(q), 300);

  const selectedImage = useMemo(() => {
    return data?.find((company) => company.id === companyId)?.image;
    // We only wanna re-run this when a new companyId is set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        name={name}
        defaultValue={customCompanyName}
        onChange={(value) => debouncedQuery(value)}
        onSelect={(value) => handleSelect(value)}
        options={
          data?.map((company) => ({
            image: company?.image,
            label: company.name,
            value: company.id,
          })) || []
        }
        selectedValue={companyId}
        selectedImage={selectedImage}
        label={label}
        isLoading={isLoading}
        resetOnBlur={false}
      />
      {errors[name] && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.StatusError}
        >
          {errors[name]?.message as string}
        </Typography>
      )}
    </div>
  );
};

export default ProfileCompany;
