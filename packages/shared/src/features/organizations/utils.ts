import { settingsUrl } from '../../lib/constants';

export const getOrganizationSettingsUrl = (orgId: string, suffix?: string) =>
  `${settingsUrl}/organization/${orgId}${suffix ? `/${suffix}` : ''}`;
