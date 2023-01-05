import { useContextMenu } from '@dailydotdev/react-contexify';

export default function useSquadMenu(): {
  onMenuClick: (e: React.MouseEvent) => void;
} {
  const { show } = useContextMenu({ id: 'squad-menu-context' });

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
