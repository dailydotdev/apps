import React from 'react';
import useFeedSettings from '../../hooks/useFeedSettings';
import { TOGGLEABLE_TYPES } from '../feeds/FeedSettings/sections/FeedSettingsContentPreferencesSection';
import { BlockIcon, PlusIcon } from '../icons';
import { useAdvancedSettings } from '../../hooks';
import { MenuIcon } from '../MenuIcon';
import { capitalize } from '../../lib/strings';
import { PostType, type Post } from '../../graphql/posts';

interface UseFeedContentTypeAction {
  post: Post;
  customFeedId?: string;
  onActionSuccess: (copy: string, onUndo: () => void) => Promise<void>;
}

const getContentTypeActionTarget = (type: string): string => {
  if (type === PostType.LiveRoom) {
    return 'Standups';
  }

  const [target] = type.split(':');
  return target;
};

export const useFeedContentTypeAction = ({
  post,
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

  if (!advancedSettings || !post) {
    return null;
  }

  const contentType = advancedSettings.find(
    ({ options }) =>
      options?.type &&
      (options.type === post.sharedPost?.type || options.type === post.type),
  );

  if (!contentType) {
    return null;
  }

  if (!TOGGLEABLE_TYPES.includes(contentType.title)) {
    return null;
  }

  const type = contentType.options?.type;

  if (!type) {
    return null;
  }

  const { id } = contentType;
  const isEnabled = checkSettingsEnabledState(id);
  const target = getContentTypeActionTarget(type);

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
