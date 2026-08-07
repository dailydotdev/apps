import { Feature } from './feature';

// Features evaluated before the application bundle loads belong here so
// server entry points do not pull in featureManagement's client dependencies.
export const featureLayoutV2 = new Feature('layout_v2', false);
