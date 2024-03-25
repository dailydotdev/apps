import React, { useState } from 'react';
import useContextMenu from './useContextMenu';
import { Tag } from '../graphql/feedSettings';
import { ContextMenu } from './constants';

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
