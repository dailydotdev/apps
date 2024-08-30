import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { gqlClient } from '../../../graphql/common';
import {
  SourceCategoryData,
  SOURCE_CATEGORIES_QUERY,
} from '../../../graphql/sources';
import {
  generateQueryKey,
  RequestKey,
  flattenInfiniteQuery,
} from '../../../lib/query';
import { Dropdown } from '../../fields/Dropdown';
import { Radio } from '../../fields/Radio';
import { StatusDescription } from './common';
import { SquadSettingsSection } from './SquadSettingsSection';

interface CategoryDropdownProps {
  initialCategory: string;
  isPublic: boolean;
  categoryHint?: string;
  onCategoryChange?: (category: string) => void;
}

const classes = {
  wrapper: 'w-full',
  content: 'w-fit',
};

export enum PrivacyOption {
  Private = 'private',
  Public = 'public',
}

export function SquadPrivacySection({
  initialCategory,
  isPublic = true,
  categoryHint,
  onCategoryChange,
}: CategoryDropdownProps): ReactElement {
  const [privacy, setPrivacy] = useState(
    isPublic ? PrivacyOption.Public : PrivacyOption.Private,
  );
  const isPrivate = privacy === PrivacyOption.Private;
  const [selected, setSelected] = useState(-1);
  const { data } = useQuery<SourceCategoryData>(
    generateQueryKey(RequestKey.Source, null, 'categories'),
    () => gqlClient.request(SOURCE_CATEGORIES_QUERY),
    { staleTime: Infinity },
  );
  const list = useMemo(
    () => data?.categories?.edges?.map(({ node }) => node),
    [data],
  );

  useEffect(() => {
    if (!list?.length) {
      return;
    }

    const index = list.findIndex(({ id }) => id === initialCategory);

    if (index === -1) {
      return;
    }

    setSelected(index);
  }, [initialCategory, list]);

  const privacyOptions = useMemo(() => {
    return [
      {
        label: 'Public',
        value: PrivacyOption.Public,
        className: classes,
        afterElement: (
          <div className="ml-9 flex flex-col gap-4">
            <StatusDescription>
              Squad is searchable, publicly listed in our squad directory, and
              open for everyone to join. It’s ideal for building a community or
              for content creators.
            </StatusDescription>
            {list && (
              <Dropdown
                placeholder="Select category"
                className={{
                  container: 'w-56',
                  button: categoryHint && 'border border-status-error',
                }}
                options={list.map(({ title }) => title)}
                selectedIndex={selected}
                onChange={(_, index) => {
                  setSelected(index);
                  onCategoryChange?.(list[index].id);
                }}
                disabled={isPrivate}
              />
            )}
            {list && !isPrivate && (
              <input
                type="hidden"
                id="categoryId"
                name="categoryId"
                value={list[selected]?.id}
              />
            )}
          </div>
        ),
      },
      {
        label: 'Private',
        value: PrivacyOption.Private,
        className: classes,
        afterElement: (
          <StatusDescription className="ml-9">
            Squad is invite-only, hidden from the directory, and perfect for
            teams and smaller groups of people who know each other and want to
            collaborate privately.
          </StatusDescription>
        ),
      },
    ];
  }, [isPrivate, list, categoryHint, selected, onCategoryChange]);

  return (
    <SquadSettingsSection title="Squad type" className="w-full">
      <Radio
        name="status"
        options={privacyOptions}
        value={privacy}
        className={{ container: 'mt-3 gap-4' }}
        onChange={(value) => setPrivacy(value)}
      />
    </SquadSettingsSection>
  );
}
