import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useAdvancedSettings } from '@dailydotdev/shared/src/hooks/feed/useAdvancedSettings';
import { getContentFromGroup } from '@dailydotdev/shared/src/components/filters/helpers';
import { AdvancedSettingsGroup } from '@dailydotdev/shared/src/graphql/feedSettings';
import { FilterCheckbox } from '@dailydotdev/shared/src/components/fields/FilterCheckbox';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ControlSection } from '../FeedScreenContext';
import { PanelSection } from './Section';

/**
 * The post categories, read and written through the same feed settings hooks
 * as Content preferences, so Tune and settings show one set of switches.
 */
export const CategoriesSection = (): ReactElement => {
  const { user } = useAuthContext();
  const feedId = user?.id;
  const { advancedSettings } = useFeedSettings({ feedId });
  const { selectedSettings, onToggleSettings } = useAdvancedSettings({
    feedId,
  });
  const categories = useMemo(
    () =>
      getContentFromGroup(advancedSettings ?? [], [
        AdvancedSettingsGroup.ContentCuration,
      ]),
    [advancedSettings],
  );

  return (
    <PanelSection
      section={ControlSection.Categories}
      description="Uncheck a kind of post to hide it from your feed. These are the post types in Content preferences."
    >
      <div className="flex flex-col">
        {categories.map(({ id, title, description, defaultEnabledState }) => (
          <FilterCheckbox
            key={id}
            name={`tune-category-${id}`}
            checked={selectedSettings[id] ?? defaultEnabledState}
            description={description}
            descriptionClassName="text-text-tertiary"
            onToggleCallback={() => onToggleSettings(id, defaultEnabledState)}
          >
            <Typography bold type={TypographyType.Callout}>
              {title}
            </Typography>
          </FilterCheckbox>
        ))}
      </div>
    </PanelSection>
  );
};
