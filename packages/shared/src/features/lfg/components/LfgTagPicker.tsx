import type { ReactElement } from 'react';
import React, { useId, useState } from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SearchField } from '../../../components/fields/SearchField';
import { MiniCloseIcon } from '../../../components/icons/MiniClose';
import { PlusIcon } from '../../../components/icons/Plus';
import useDebounce from '../../../hooks/useDebounce';
import {
  MIN_SEARCH_QUERY_LENGTH,
  useTagSearch,
} from '../../../hooks/useTagSearch';
import type { Origin } from '../../../lib/log';
import { useLfgTagLabel } from './LfgTags';

const SUGGESTION_LIMIT = 8;

interface LfgTagPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  max: number;
  // Shown before the reader searches.
  suggestions: string[];
  origin: Origin;
  selectedVariant?: ButtonVariant;
}

// Topics come from the tags that already exist on daily.dev, so they match
// what people follow.
export const LfgTagPicker = ({
  value,
  onChange,
  max,
  suggestions,
  origin,
  selectedVariant = ButtonVariant.Primary,
}: LfgTagPickerProps): ReactElement => {
  const inputId = useId();
  const getLabel = useLfgTagLabel();
  const [query, setQuery] = useState('');
  const search = useDebounce(query.trim().toLowerCase().replace(/^#/, ''), 300);
  const isSearching = search.length >= MIN_SEARCH_QUERY_LENGTH;
  const { data, isLoading } = useTagSearch({
    value: isSearching ? search : '',
    origin,
  });
  const isFull = value.length >= max;
  const options = (
    isSearching
      ? data?.searchTags.tags.map(({ name }) => name).filter(Boolean) ?? []
      : suggestions
  )
    .filter((tag): tag is string => !!tag && !value.includes(tag))
    .slice(0, SUGGESTION_LIMIT);

  const add = (tag: string) => {
    if (isFull) {
      return;
    }

    onChange([...value, tag]);
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={selectedVariant}
              size={ButtonSize.Small}
              icon={<MiniCloseIcon />}
              iconPosition={ButtonIconPosition.Right}
              aria-label={`Remove ${getLabel(tag)}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
            >
              {getLabel(tag)}
            </Button>
          ))}
        </div>
      )}
      {!isFull && (
        <>
          <SearchField
            inputId={`lfg-tags-${inputId}`}
            placeholder="Search tags"
            fieldSize="medium"
            value={query}
            valueChanged={setQuery}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            {options.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                onClick={() => add(tag)}
              >
                {getLabel(tag)}
              </Button>
            ))}
            {isSearching && !isLoading && options.length === 0 && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Quaternary}
              >
                No tag called #{search} yet.
              </Typography>
            )}
          </div>
        </>
      )}
    </div>
  );
};
