import React, { useState } from 'react';

import { Tag } from '../graphql/feedSettings';
import { ContextMenu } from './constants';
import useContextMenu from './useContextMenu';

export default function useTagContext(): {
  contextSelectedTag;
  setContextSelectedTag;
  onTagContextOptions;
} {
  const [contextSelectedTag, setContextSelectedTag] = useState<Tag>();

  const { onMenuClick: showTagOptionsMenu } = useContextMenu({
    id: ContextMenu.TagOptionsContext,
  });

  const onTagContextOptions = (event: React.MouseEvent, tag: Tag): void => {
    setContextSelectedTag(tag);
    showTagOptionsMenu(event);
  };

  return {
    contextSelectedTag,
    setContextSelectedTag,
    onTagContextOptions,
  };
}
