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
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import type { Company } from '../../../lib/userCompany';

type ProfileCompanyProps = {
  name: string;
  label?: string;
  type?: AutocompleteType;
  company?: Company | null;
  entityLabel?: string;
};

const ProfileCompany = ({
  name,
  label = 'Company',
  type = AutocompleteType.Company,
  company,
  entityLabel = 'company',
}: ProfileCompanyProps) => {
  const { user } = useAuthContext();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const customCompanyName = watch(name);
  const companyId = watch('companyId');
  const storedCustomCompanyName = watch('storedCustomCompanyName');

  const handleUnlink = () => {
    setValue('companyId', '');
    setValue(name, storedCustomCompanyName || company?.name || '');
  };
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
    const selectedCompany = data?.find((item) => item.id === value);
    if (selectedCompany) {
      setValue('companyId', selectedCompany.id);
    }
  };

  const [debouncedQuery] = useDebounceFn<string>((q) => handleSearch(q), 300);

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        name={name}
        defaultValue={customCompanyName}
        onChange={(value) => debouncedQuery(value)}
        onSelect={(value) => handleSelect(value)}
        options={
          data?.map((item) => ({
            image: item?.image,
            label: item.name,
            value: item.id,
          })) || []
        }
        selectedValue={companyId}
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
      {company && companyId && (
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          className="mt-2 self-start"
          onClick={handleUnlink}
        >
          Unlink {entityLabel}
        </Button>
      )}
    </div>
  );
};

export default ProfileCompany;
