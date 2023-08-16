import { useState } from 'react';
import { useContextMenu as useContexifyContextMenu } from '@dailydotdev/react-contexify';

export default function useContextMenu({ id }: { id: string }): {
  onMenuClick: (e: React.MouseEvent) => void;
} {
  const [menu, setMenu] = useState(false);
  const { show } = useContexifyContextMenu({ id });

  const onMenuClick = (e: React.MouseEvent) => {
    setMenu(!menu);
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    if (!menu) {
      show(e, {
        position: { x: right, y: bottom + 4 },
      });
    }
  };

  return {
    onMenuClick,
  };
}
