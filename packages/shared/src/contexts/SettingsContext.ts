import React from 'react';
import { Spaciness } from '../graphql/settings';

export type SettingsContextData = {
  spaciness: Spaciness;
  themeMode:string;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  setUIThemeMode: (mode) => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
  toggleInsaneMode: () => Promise<void>;
  loadedSettings: boolean;
};

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;
