import { settingsUrl } from '../../lib/constants';
import { OrganizationMemberRole } from './types';

export const getOrganizationSettingsUrl = (orgId: string, suffix?: string) =>
  `${settingsUrl}/organization/${orgId}${suffix ? `/${suffix}` : ''}`;

export const isPrivilegedOrganizationRole = (role: OrganizationMemberRole) =>
  role === OrganizationMemberRole.Owner ||
  role === OrganizationMemberRole.Admin;
