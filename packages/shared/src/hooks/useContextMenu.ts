import { useContextMenu as useContexifyContextMenu } from '@dailydotdev/react-contexify';

export default function useContextMenu({ id }: { id: string }): {
  onMenuClick: (e: React.MouseEvent) => void;
} {
  const { show } = useContexifyContextMenu({ id });

  const onMenuClick = (e: React.MouseEvent) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    show(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  return {
    onMenuClick,
  };
}
