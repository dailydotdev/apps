import React from 'react';

export type SettingsContextData = {
  spaciness: 'eco' | 'roomy' | 'cozy';
  lightMode: boolean;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  toggleLightMode: () => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: string) => Promise<void>;
};

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;
