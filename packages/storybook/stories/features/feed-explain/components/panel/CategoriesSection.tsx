import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useAdvancedSettings } from '@dailydotdev/shared/src/hooks/feed/useAdvancedSettings';
import { getContentFromGroup } from '@dailydotdev/shared/src/components/filters/helpers';
import type { AdvancedSettings } from '@dailydotdev/shared/src/graphql/feedSettings';
import { AdvancedSettingsGroup } from '@dailydotdev/shared/src/graphql/feedSettings';
import { FilterCheckbox } from '@dailydotdev/shared/src/components/fields/FilterCheckbox';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { describeAction, FeedAction, glossary } from '../../policy/glossary';
import { getCurations, hasCurationData } from '../../policy/curation';
import { expiryKey, formatUntil, getUntilFor } from '../../policy/timed';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { PlusDurationPicker } from '../plus';
import { plural } from '../settings/pages';
import { PanelSection } from './Section';
import { getDurationFor } from './LevelTiming';

/** How long a hidden category stays hidden, and when it shows again. */
const HiddenTiming = ({ curation }: { curation: string }): ReactElement => {
  const store = usePersonalization();
  const until = getUntilFor(store.state, expiryKey.curation(curation));
  const [duration, setDuration] = useState(() =>
    getDurationFor(until, store.now),
  );

  return (
    <span className="ml-9 flex flex-col gap-1.5 pb-3">
      <PlusDurationPicker
        value={duration}
        onChange={(next) => {
          setDuration(next);
          store.setCurationHidden(curation, true, next);
        }}
      />
      {until !== undefined && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Hidden {formatUntil(until, store.now)}, then it shows again.
        </Typography>
      )}
    </span>
  );
};

const CategoryRow = ({
  setting,
  isShown,
  count,
  onToggle,
}: {
  setting: AdvancedSettings;
  isShown: boolean;
  /** How many posts of this kind your next page has, once posts say. */
  count?: number;
  onToggle: () => void;
}): ReactElement => {
  const curation = setting.options?.type;
  const description =
    count === undefined
      ? setting.description
      : `${
          count ? plural(count, 'post', 'posts') : 'No posts'
        } on your next page. ${setting.description}`;

  return (
    <div className="flex flex-col">
      <Tooltip
        content={
          isShown
            ? describeAction(FeedAction.HideCategory, setting.title)
            : `${setting.title} is hidden. Check it to show it again.`
        }
      >
        <div>
          <FilterCheckbox
            name={`tune-category-${setting.id}`}
            checked={isShown}
            description={description}
            descriptionClassName="text-text-tertiary"
            onToggleCallback={onToggle}
          >
            <Typography bold type={TypographyType.Callout}>
              {setting.title}
            </Typography>
          </FilterCheckbox>
        </div>
      </Tooltip>
      {!isShown && curation && <HiddenTiming curation={curation} />}
    </div>
  );
};

/**
 * The post categories, read and written through the same feed settings hooks
 * as Content preferences, so Tune and settings show one set of switches.
 */
export const CategoriesSection = (): ReactElement => {
  const { user } = useAuthContext();
  const { next } = usePersonalization();
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
  // Counts wait for posts to carry their categories, as the cards do.
  const counts = useMemo(() => {
    if (!hasCurationData()) {
      return undefined;
    }
    const map = new Map<string, number>();
    next.served.forEach(({ post }) =>
      getCurations(post).forEach((curation) =>
        map.set(curation, (map.get(curation) ?? 0) + 1),
      ),
    );
    return map;
  }, [next.served]);

  return (
    <PanelSection
      section={ControlSection.Categories}
      description={`Uncheck a kind of post to hide it. ${
        glossary[FeedAction.HideCategory].effect
      } Content preferences has the same switches.`}
    >
      <div className="flex flex-col">
        {categories.map((setting) => (
          <CategoryRow
            key={setting.id}
            setting={setting}
            isShown={
              selectedSettings[setting.id] ?? setting.defaultEnabledState
            }
            count={
              counts && setting.options?.type
                ? counts.get(setting.options.type) ?? 0
                : undefined
            }
            onToggle={() =>
              onToggleSettings(setting.id, setting.defaultEnabledState)
            }
          />
        ))}
      </div>
    </PanelSection>
  );
};
