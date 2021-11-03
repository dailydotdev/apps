import { useState } from 'react';
import { useContextMenu } from '@dailydotdev/react-contexify';
import { Tag } from '../graphql/feedSettings';

export default function useTagContext(): {
  contextSelectedTag;
  setContextSelectedTag;
  onTagContextOptions;
} {
  const [contextSelectedTag, setContextSelectedTag] = useState<Tag>();
  const { show: showTagOptionsMenu } = useContextMenu({
    id: 'tag-options-context',
  });
  const onTagContextOptions = (event: React.MouseEvent, tag: Tag): void => {
    setContextSelectedTag(tag);
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    showTagOptionsMenu(event, {
      position: { x: right, y: bottom + 4 },
    });
  };

  return {
    contextSelectedTag,
    setContextSelectedTag,
    onTagContextOptions,
  };
}
