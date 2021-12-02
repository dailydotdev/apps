import { useMemo, useState } from 'react';

export type SidebarMenuProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
};

export default function useSidebarMenu(): SidebarMenuProps {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log(sidebarOpen);

  return {
    sidebarOpen,
    setSidebarOpen,
  };
}
