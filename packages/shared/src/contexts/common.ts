import React from 'react';
import { Permissions } from 'webextension-polyfill';

export const BOOT_LOCAL_KEY = 'boot:local';
export const BOOT_QUERY_KEY = 'boot';

export type RequestContentScripts = (data: {
  origin: string;
  skipRedirect?: boolean;
}) => Promise<boolean>;

export interface ExtensionContextData {
  getContentScriptPermission?: () => Promise<boolean>;
  requestContentScripts?: RequestContentScripts;
  registerBrowserContentScripts?: () => Promise<void>;
  getHostPermission?: () => Promise<boolean>;
  requestHostPermissions?: Permissions.Static['request'];
  origins?: string[];
}
export const ExtensionContext = React.createContext<ExtensionContextData>({});
