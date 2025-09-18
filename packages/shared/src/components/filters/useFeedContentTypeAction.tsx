import React from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { TOGGLEABLE_TYPES } from '../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';
import { BlockIcon, PlusIcon } from '../icons';
import { useAdvancedSettings } from '../../hooks';
import type { PostType } from '../../types';
import { MenuIcon } from '../MenuIcon';
import { capitalize } from '../../lib/strings';

interface UseFeedContentTypeAction {
  type: PostType;
  customFeedId?: string;
  onActionSuccess: (copy: string, onUndo: () => void) => Promise<void>;
}

export const useFeedContentTypeAction = ({
  type,
  customFeedId,
  onActionSuccess,
}: UseFeedContentTypeAction) => {
  const { advancedSettings, checkSettingsEnabledState } = useFeedSettings({
    enabled: true,
    feedId: customFeedId,
  });
  const { onUpdateSettings } = useAdvancedSettings({
    enabled: false,
    feedId: customFeedId,
  });

  const contentType = advancedSettings?.find(
    ({ options }) => options?.type === type,
  );

  if (!contentType) {
    return null;
  }

  if (!TOGGLEABLE_TYPES.includes(contentType.title)) {
    return null;
  }

  const { id } = contentType;
  const isEnabled = checkSettingsEnabledState(id);
  const [target] = type.split(':');

  const onToggle = async () => {
    const icon = isEnabled ? '⛔️' : '✅';
    const update = isEnabled ? 'blocked' : 'unblocked';
    await onUpdateSettings([{ id, enabled: !isEnabled }]);
    await onActionSuccess(
      `${icon} ${capitalize(target)} content ${update}`,
      () => onUpdateSettings([{ id, enabled: !isEnabled }]),
    );
  };

  const action = isEnabled ? `Don't show` : 'Show';

  return {
    icon: (
      <MenuIcon
        key={`settings-${id}`}
        Icon={isEnabled ? BlockIcon : PlusIcon}
      />
    ),
    label: `${action} ${target} content`,
    action: onToggle,
  };
};
