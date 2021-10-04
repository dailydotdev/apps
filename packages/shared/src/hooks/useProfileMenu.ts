import { useContextMenu } from 'react-contexify';

export default function useProfileMenu(width: number): {
  onMenuClick: (e: React.MouseEvent) => void;
} {
  const { show } = useContextMenu({ id: 'profile-context' });

  const onMenuClick = (e: React.MouseEvent) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    show(e, {
      position: { x: right - width * 16, y: bottom + 4 },
    });
  };

  return {
    onMenuClick,
  };
}
