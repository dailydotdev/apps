import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import useFeedSettings from '../../hooks/useFeedSettings';
import type { AdvancedSettings } from '../../graphql/feedSettings';
import { getContentCurationList, getContentTypeList } from '../filters/helpers';
import { Checkbox } from '../fields/Checkbox';
import { useSearchContextProvider } from '../../contexts/search/SearchContext';
import type { SearchTimeKey } from '../../graphql/search';
import { SearchTime, searchableSearchPostTypes } from '../../graphql/search';
import { VIcon } from '../icons';

type SearchFilterOption = {
  name: string;
  type: string;
};

const getSearchFilterOptions = (
  items: ReturnType<typeof getContentTypeList>,
): SearchFilterOption[] =>
  items
    .filter(
      (item): item is AdvancedSettings & { options: { type: string } } =>
        !!item.options?.type,
    )
    .map(({ title, options }) => ({
      name: title,
      type: options.type,
    }));

export const useSearchContentTypeOptions = (): SearchFilterOption[] => {
  const { advancedSettings } = useFeedSettings();

  return useMemo(() => {
    const searchablePostTypes = new Set<string>(searchableSearchPostTypes);

    return getSearchFilterOptions(getContentTypeList(advancedSettings)).filter(
      ({ type }) => searchablePostTypes.has(type),
    );
  }, [advancedSettings]);
};

export const useSearchContentCurationOptions = (): SearchFilterOption[] => {
  const { advancedSettings } = useFeedSettings();

  return useMemo(
    () => getSearchFilterOptions(getContentCurationList(advancedSettings)),
    [advancedSettings],
  );
};

type SearchFilterCheckboxListProps = {
  options: SearchFilterOption[];
  selections: Record<string, boolean>;
  onToggle: (type: string, checked: boolean) => void;
};

export const SearchFilterCheckboxList = ({
  options,
  selections,
  onToggle,
}: SearchFilterCheckboxListProps): ReactElement | null => {
  if (!options.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 px-2 py-2">
      {options.map(({ name, type }) => (
        <Checkbox
          key={type}
          name={type}
          checked={!!selections[type]}
          onToggleCallback={(checked) => onToggle(type, checked)}
        >
          {name}
        </Checkbox>
      ))}
    </div>
  );
};

export const SearchFilterPostTypeList = (): ReactElement | null => {
  const options = useSearchContentTypeOptions();
  const { postTypes, setPostTypes } = useSearchContextProvider();

  return (
    <SearchFilterCheckboxList
      options={options}
      selections={postTypes}
      onToggle={(type, checked) =>
        setPostTypes((prev) => ({ ...prev, [type]: checked }))
      }
    />
  );
};

export const SearchFilterContentCurationList = (): ReactElement | null => {
  const options = useSearchContentCurationOptions();
  const { contentCuration, setContentCuration } = useSearchContextProvider();

  return (
    <SearchFilterCheckboxList
      options={options}
      selections={contentCuration}
      onToggle={(type, checked) =>
        setContentCuration((prev) => ({ ...prev, [type]: checked }))
      }
    />
  );
};

export const SearchFilterTimeList = (): ReactElement => {
  const { time, setTime } = useSearchContextProvider();

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(SearchTime).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setTime(value as SearchTimeKey)}
          className={classNames(
            'flex h-10 items-center rounded-8 px-3 text-left typo-callout',
            time === value
              ? 'font-bold text-text-primary'
              : 'text-text-tertiary',
          )}
        >
          {label}
          <span className="flex-1" />
          {time === value && <VIcon className="ml-2" />}
        </button>
      ))}
    </div>
  );
};
