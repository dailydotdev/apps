import type { ReactElement } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import TabList from '@dailydotdev/shared/src/components/tabs/TabList';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePersonalization } from './PersonalizationContext';
import type { FeedSettingsPage } from './settings/pages';
import { plural } from './settings/pages';
import {
  rankingControls,
  tuneTabs,
  useShownControls,
} from './settings/sections';
import { SettingDivider } from './settings/common';
import { useSettingsStoreBridge } from './settings/settingsMocks';

/** How the page moved since Tune opened, in one line. */
const useMovement = (): string => {
  const { served, next } = usePersonalization();
  const before = new Map(
    served.map(({ post, position }) => [post.id, position]),
  );
  const after = new Set(next.served.map(({ post }) => post.id));
  const incoming = next.served.filter(({ post }) => !before.has(post.id));
  const moved = next.served.filter(
    ({ post, position }) =>
      before.has(post.id) && before.get(post.id) !== position,
  );
  const left = served.filter(({ post }) => !after.has(post.id));
  const parts = [
    incoming.length && plural(incoming.length, 'new post', 'new posts'),
    moved.length && `${moved.length} moved`,
    left.length && `${left.length} left the page`,
  ].filter(Boolean);

  return parts.length
    ? `${parts.join(', ')}.`
    : 'Change anything and watch your feed follow.';
};

/**
 * Tune mode's controls, next to the live feed: the same sections Feed
 * settings shows, from `rankingControls`, grouped into tabs.
 */
export const TunePanel = ({
  tab,
  onTabChange,
  onDone,
  onOpenSettings,
  isSheet,
}: {
  tab: string;
  onTabChange: (tab: string) => void;
  /** Leaves Tune with the feed as it is now. */
  onDone: () => void;
  onOpenSettings: (page: FeedSettingsPage) => void;
  /** A phone's bottom sheet, with the feed above it. */
  isSheet?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const { pendingCount, undo } = store;
  const movement = useMovement();
  // Categories read feed settings through the story's API mocks, which
  // answer from this store while Tune is open.
  useSettingsStoreBridge();
  const tabControls = rankingControls.filter((control) => control.tab === tab);
  const controls = useShownControls(tabControls, store.state, tab);
  // The tab's own settings page, not the Overview it borrows a switch from.
  const settingsPage = tabControls[tabControls.length - 1].page;

  return (
    <div
      data-tune
      className="flex h-full min-h-0 flex-col bg-background-default"
    >
      <header
        className={classNames(
          'flex flex-col gap-3 border-b border-border-subtlest-tertiary',
          isSheet ? 'px-4 pb-2 pt-3' : 'px-6 pb-3 pt-6',
        )}
      >
        <div className="flex items-center gap-3">
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            className="min-w-0 flex-1"
            bold
          >
            Tune your feed
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => onOpenSettings(settingsPage)}
          >
            All settings
          </Button>
          <CloseButton
            size={ButtonSize.Small}
            aria-label="Close Tune"
            onClick={onDone}
          />
        </div>
        {/* Four tabs outgrow a phone's sheet and the desktop panel. */}
        <div
          className={classNames(
            'overflow-x-auto no-scrollbar',
            isSheet ? '-mx-4 px-4' : '-mx-6 px-6',
          )}
        >
          <TabList
            items={tuneTabs.map((label) => ({ label }))}
            active={tab}
            onClick={(label) => onTabChange(label)}
            autoScrollActive
          />
        </div>
      </header>
      <div
        className={classNames(
          'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto',
          isSheet ? 'p-4' : 'p-6',
        )}
      >
        {controls.map(({ section, Controls }, index) => (
          <Fragment key={section}>
            {index > 0 && <SettingDivider />}
            <Controls />
          </Fragment>
        ))}
      </div>
      <footer
        className={classNames(
          'flex items-center gap-2 border-t border-border-subtlest-tertiary',
          isSheet ? 'px-4 py-2' : 'px-6 py-3',
        )}
      >
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="min-w-0 flex-1"
          aria-live="polite"
        >
          {movement}
        </Typography>
        {pendingCount > 0 && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<UndoIcon />}
            onClick={undo}
          >
            Undo
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onDone}
        >
          Done
        </Button>
      </footer>
    </div>
  );
};
