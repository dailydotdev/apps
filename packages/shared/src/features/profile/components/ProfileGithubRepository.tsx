import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Autocomplete from '../../../components/fields/Autocomplete';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getAutocompleteGithubRepositories } from '../../../graphql/autocomplete';
import { useAuthContext } from '../../../contexts/AuthContext';
import useDebounceFn from '../../../hooks/useDebounceFn';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../components/typography/Typography';

type ProfileGithubRepositoryProps = {
  name: string;
  label?: string;
};

const ProfileGithubRepository = ({
  name,
  label = 'GitHub Repository',
}: ProfileGithubRepositoryProps) => {
  const { user } = useAuthContext();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const repositorySearch = watch(name);
  const repository = watch('repository');
  const { data, isLoading } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.Autocomplete,
      user,
      'github-repository',
      repositorySearch,
    ),
    queryFn: () => getAutocompleteGithubRepositories(repositorySearch),
    enabled: !!repositorySearch && repositorySearch.length >= 2,
  });

  const handleSearch = (query: string) => {
    if (query === '') {
      setValue('repository', null);
    }
    setValue(name, query);
  };

  const handleSelect = (value: string) => {
    const selectedRepo = data?.find((repo) => repo.id === value);
    if (selectedRepo) {
      setValue('repository', {
        id: selectedRepo.id,
        owner: selectedRepo.owner,
        name: selectedRepo.name,
        url: selectedRepo.url,
        image: selectedRepo.image,
      });
      setValue(name, selectedRepo.fullName);
    }
  };

  const [debouncedQuery] = useDebounceFn<string>((q) => handleSearch(q), 300);

  const repositoryFullName = repository?.owner
    ? `${repository.owner}/${repository.name}`
    : repository?.name;

  // Include saved repository in options so Autocomplete can display its image
  const options = useMemo(() => {
    const searchResults =
      data?.map((repo) => ({
        image: repo.image,
        label: repo.fullName,
        value: repo.id,
      })) || [];

    // Add saved repository if not already in search results
    if (repository?.id && repositoryFullName) {
      const existsInResults = searchResults.some(
        (opt) => opt.value === repository.id,
      );
      if (!existsInResults) {
        return [
          {
            image: repository.image,
            label: repositoryFullName,
            value: repository.id,
          },
          ...searchResults,
        ];
      }
    }

    return searchResults;
  }, [data, repository, repositoryFullName]);

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        name={name}
        defaultValue={repositorySearch || repositoryFullName || ''}
        onChange={(value) => debouncedQuery(value)}
        onSelect={(value) => handleSelect(value)}
        options={options}
        selectedValue={repository?.id}
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

export default ProfileGithubRepository;
