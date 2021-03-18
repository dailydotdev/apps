import React from 'react';
import { Spaciness } from '../graphql/settings';

export type SettingsContextData = {
  spaciness: Spaciness;
  lightMode: boolean;
  showOnlyUnreadPosts: boolean;
  openNewTab: boolean;
  toggleLightMode: () => Promise<void>;
  toggleShowOnlyUnreadPosts: () => Promise<void>;
  toggleOpenNewTab: () => Promise<void>;
  setSpaciness: (density: Spaciness) => Promise<void>;
};

const SettingsContext = React.createContext<SettingsContextData>(null);
export default SettingsContext;
