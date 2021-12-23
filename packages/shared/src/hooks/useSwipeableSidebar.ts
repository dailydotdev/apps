import { SwipeableHandlers, useSwipeable } from 'react-swipeable';

interface UseSwipeableSidebarProps {
  sidebarRendered: boolean;
  openMobileSidebar: boolean;
  setOpenMobileSidebar: (value: boolean) => void;
}
export function useSwipeableSidebar({
  sidebarRendered,
  openMobileSidebar,
  setOpenMobileSidebar,
}: UseSwipeableSidebarProps): SwipeableHandlers {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (sidebarRendered === false && openMobileSidebar) {
        setOpenMobileSidebar(false);
      }
    },
    onSwipedRight: () => {
      if (sidebarRendered === false && !openMobileSidebar) {
        setOpenMobileSidebar(true);
      }
    },
    preventDefaultTouchmoveEvent: true,
  });

  return handlers;
}
