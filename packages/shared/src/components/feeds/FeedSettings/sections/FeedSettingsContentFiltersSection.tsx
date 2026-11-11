import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import { Divider } from '../../../utilities/Divider';
import { FeedSettingsContentPreferencesSection } from './FeedSettingsContentPreferencesSection';
import { FeedSettingsBlockingSection } from './FeedSettingsBlockingSection';

const FiltersPart = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section aria-labelledby={id} className="flex flex-col gap-4">
    <Typography
      id={id}
      tag={TypographyTag.H2}
      type={TypographyType.Body}
      className="tablet:typo-title3"
      bold
    >
      {title}
    </Typography>
    {children}
  </section>
);

/** For You's Filters: Content preferences and Blocked content, one page. */
export const FeedSettingsContentFiltersSection = (): ReactElement => (
  <>
    <FiltersPart id="feed-filters-preferences" title="Content preferences">
      <FeedSettingsContentPreferencesSection />
    </FiltersPart>
    <Divider className="my-1 bg-border-subtlest-tertiary" />
    <FiltersPart id="feed-filters-blocked" title="Blocked">
      <FeedSettingsBlockingSection />
    </FiltersPart>
  </>
);
