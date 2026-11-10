import type { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  EarthIcon,
  HashtagIcon,
  MiniCloseIcon,
  PlusIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { Radio } from '../../components/fields/Radio';
import { SearchField } from '../../components/fields/SearchField';
import { gqlClient } from '../../graphql/common';
import { GET_RECOMMENDED_TAGS_QUERY } from '../../graphql/feedSettings';
import type { TagsData } from '../../graphql/feedSettings';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import {
  MIN_SEARCH_QUERY_LENGTH,
  useTagSearch,
} from '../../hooks/useTagSearch';
import { Origin } from '../../lib/log';
import useDebounceFn from '../../hooks/useDebounceFn';
import type { CampaignAudience } from '../../graphql/campaigns';

export enum BoostLocation {
  Worldwide = 'worldwide',
  TopMarkets = 'top_markets',
  Custom = 'custom',
}

export interface BoostAudienceValue {
  tags: string[];
  location: BoostLocation;
  countries: string[];
}

// ISO 3166-1 alpha-2 codes the API accepts
const countryCodes = [
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CC',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CU',
  'CV',
  'CX',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FM',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HM',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IR',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KP',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MH',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MP',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NF',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PW',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SY',
  'SZ',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'UM',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VI',
  'VN',
  'VU',
  'WF',
  'WS',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW',
];

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

export const getCountryName = (code: string): string =>
  regionNames?.of(code) ?? code;

// The high-value developer markets, picked in one go
export const topMarketCountries = [
  'US',
  'CA',
  'GB',
  'IE',
  'DE',
  'FR',
  'NL',
  'BE',
  'LU',
  'AT',
  'CH',
  'SE',
  'NO',
  'DK',
  'FI',
  'IS',
  'IL',
  'AU',
  'NZ',
];

export const getAudienceCountries = ({
  location,
  countries,
}: BoostAudienceValue): string[] => {
  if (location === BoostLocation.TopMarkets) {
    return topMarketCountries;
  }

  return location === BoostLocation.Custom ? countries : [];
};

// What the boost sends, undefined while it still targets the post's own tags
// worldwide
export const toCampaignAudience = (
  value: BoostAudienceValue,
  postTags: string[],
): CampaignAudience | undefined => {
  const countries = getAudienceCountries(value);
  const isPostTags =
    value.tags.length === postTags.length &&
    value.tags.every((tag) => postTags.includes(tag));

  if (isPostTags && !countries.length) {
    return undefined;
  }

  return { tags: value.tags, countries };
};

const maxSuggestions = 5;

const Chip = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}): ReactElement => (
  <Button
    type="button"
    size={ButtonSize.Small}
    variant={isSelected ? ButtonVariant.Subtle : ButtonVariant.Float}
    icon={
      isSelected ? (
        <MiniCloseIcon size={IconSize.Size16} />
      ) : (
        <PlusIcon size={IconSize.Size16} />
      )
    }
    iconPosition={
      isSelected ? ButtonIconPosition.Right : ButtonIconPosition.Left
    }
    onClick={onClick}
    aria-label={isSelected ? `Remove ${label}` : `Add ${label}`}
  >
    {label}
  </Button>
);

const SectionLabel = ({ title }: { title: string }): ReactElement => (
  <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
    {title}
  </Typography>
);

const LocationOption = ({
  name,
  description,
}: {
  name: string;
  description: string;
}): ReactElement => (
  <span className="flex flex-col py-1">
    <Typography tag={TypographyTag.Span} type={TypographyType.Callout} bold>
      {name}
    </Typography>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      {description}
    </Typography>
  </span>
);

enum AudienceRowName {
  Tags = 'tags',
  Location = 'location',
}

const AudienceRow = ({
  icon,
  title,
  summary,
  isOpen,
  onToggle,
  className,
  children,
}: {
  icon: ReactElement;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('flex flex-col gap-3 p-3', className)}>
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {title}
        </Typography>
        <Typography type={TypographyType.Callout} bold truncate>
          {summary}
        </Typography>
      </div>
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        onClick={onToggle}
      >
        {isOpen ? 'Done' : 'Edit'}
      </Button>
    </div>
    {isOpen && <div className="flex flex-col gap-3">{children}</div>}
  </div>
);

interface BoostAudienceProps {
  postTags: string[];
  value: BoostAudienceValue;
  onChange: (value: BoostAudienceValue) => void;
}

export function BoostAudience({
  postTags,
  value,
  onChange,
}: BoostAudienceProps): ReactElement {
  const [openRow, setOpenRow] = useState<AudienceRowName | null>(null);
  const [tagQuery, setTagQuery] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [updateTagSearch] = useDebounceFn<string>(
    (query) => setTagSearch(query ?? ''),
    300,
  );
  const [countryQuery, setCountryQuery] = useState('');
  const { data: recommended } = useQuery({
    queryKey: generateQueryKey(
      RequestKey.RecommendedTags,
      undefined,
      ...postTags,
    ),
    queryFn: () =>
      gqlClient.request<{ recommendedTags: TagsData }>(
        GET_RECOMMENDED_TAGS_QUERY,
        { tags: postTags, excludedTags: [] },
      ),
    staleTime: StaleTime.OneHour,
    enabled: openRow === AudienceRowName.Tags && postTags.length > 0,
  });
  const { data: searched } = useTagSearch({
    value: tagSearch,
    origin: Origin.BoostPost,
  });
  const tagOptions = (
    (tagSearch.length >= MIN_SEARCH_QUERY_LENGTH
      ? searched?.searchTags.tags
      : recommended?.recommendedTags.tags) ?? []
  )
    .map(({ name }) => name)
    .filter((tag): tag is string => !!tag && !value.tags.includes(tag))
    .slice(0, maxSuggestions);
  const countrySearch = countryQuery.trim().toLowerCase();
  const countryOptions = (
    countrySearch
      ? countryCodes.filter((code) =>
          getCountryName(code).toLowerCase().includes(countrySearch),
        )
      : topMarketCountries
  )
    .filter((code) => !value.countries.includes(code))
    .slice(0, maxSuggestions);

  const toggleTag = (tag: string) =>
    onChange({
      ...value,
      tags: value.tags.includes(tag)
        ? value.tags.filter((item) => item !== tag)
        : [...value.tags, tag],
    });
  const toggleCountry = (code: string) =>
    onChange({
      ...value,
      countries: value.countries.includes(code)
        ? value.countries.filter((item) => item !== code)
        : [...value.countries, code],
    });

  const locationSummary = (() => {
    if (value.location === BoostLocation.TopMarkets) {
      return 'Top markets';
    }

    if (value.location === BoostLocation.Custom && value.countries.length) {
      const names = value.countries.map(getCountryName);

      return names.length > 2
        ? `${names.slice(0, 2).join(', ')} +${names.length - 2}`
        : names.join(', ');
    }

    return 'Worldwide';
  })();
  const tagNames = value.tags.map((tag) => `#${tag}`);
  const tagsSummary =
    tagNames.length > 3
      ? `${tagNames.slice(0, 3).join(', ')} +${tagNames.length - 3}`
      : tagNames.join(', ') || 'Any topic';
  const toggleRow = (row: AudienceRowName) =>
    setOpenRow((current) => (current === row ? null : row));

  return (
    <div className="flex flex-col gap-1">
      <SectionLabel title="Target audience" />
      <div className="flex flex-col rounded-16 border border-border-subtlest-tertiary">
        <AudienceRow
          icon={<HashtagIcon size={IconSize.Small} />}
          title="Developers who read about"
          summary={tagsSummary}
          isOpen={openRow === AudienceRowName.Tags}
          onToggle={() => toggleRow(AudienceRowName.Tags)}
        >
          <div className="flex flex-wrap gap-2">
            {value.tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                isSelected
                onClick={() => toggleTag(tag)}
              />
            ))}
          </div>
          {tagOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                {tagSearch ? 'Matching tags' : 'Suggested for your post'}
              </Typography>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    isSelected={false}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const [tag] = tagOptions;

              if (tagSearch && tag) {
                toggleTag(tag);
                setTagQuery('');
                setTagSearch('');
              }
            }}
          >
            <SearchField
              inputId="boost-tag-search"
              fieldSize="medium"
              placeholder="Search tags"
              value={tagQuery}
              valueChanged={(query) => {
                setTagQuery(query);
                updateTagSearch(query.trim().toLowerCase());
              }}
            />
          </form>
        </AudienceRow>
        <AudienceRow
          icon={<EarthIcon size={IconSize.Small} />}
          title="Located in"
          summary={locationSummary}
          isOpen={openRow === AudienceRowName.Location}
          onToggle={() => toggleRow(AudienceRowName.Location)}
          className="border-t border-border-subtlest-tertiary"
        >
          <Radio
            name="boost-location"
            value={value.location}
            onChange={(location) => onChange({ ...value, location })}
            className={{
              container: 'w-full !gap-0',
              content: 'w-full',
              label: 'min-w-0 flex-1',
            }}
            options={[
              {
                value: BoostLocation.Worldwide,
                label: (
                  <LocationOption
                    name="Worldwide"
                    description="Every country, the widest reach"
                  />
                ),
                className: { wrapper: 'w-full' },
              },
              {
                value: BoostLocation.TopMarkets,
                label: (
                  <LocationOption
                    name="Top markets"
                    description="US, Canada, Western Europe and more"
                  />
                ),
                className: { wrapper: 'w-full' },
              },
              {
                value: BoostLocation.Custom,
                label: (
                  <LocationOption
                    name="Choose countries"
                    description="Pick the exact countries"
                  />
                ),
                className: { wrapper: 'w-full' },
              },
            ]}
          />
          {value.location === BoostLocation.Custom && (
            <div className="flex flex-col gap-3 pl-9">
              {value.countries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {value.countries.map((code) => (
                    <Chip
                      key={code}
                      label={getCountryName(code)}
                      isSelected
                      onClick={() => toggleCountry(code)}
                    />
                  ))}
                </div>
              )}
              <SearchField
                inputId="boost-country-search"
                fieldSize="medium"
                placeholder="Search countries"
                value={countryQuery}
                valueChanged={setCountryQuery}
              />
              <div className="flex flex-wrap gap-2">
                {countryOptions.map((code) => (
                  <Chip
                    key={code}
                    label={getCountryName(code)}
                    isSelected={false}
                    onClick={() => toggleCountry(code)}
                  />
                ))}
              </div>
            </div>
          )}
        </AudienceRow>
      </div>
    </div>
  );
}
