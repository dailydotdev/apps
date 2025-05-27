import type { LoggedUser, PublicProfile } from '../../lib/user';

export enum OrganizationMemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export type OrganizationMember = {
  role: OrganizationMemberRole;
  user: PublicProfile | LoggedUser;
};

export type Organization = {
  id: string;
  name: string;
  image?: string;
  seats?: number;
  members?: OrganizationMember[];
};

export type UserOrganization = {
  role: OrganizationMemberRole;
  referralToken?: string | null;
  referralUrl?: string | null;
  organization: Organization;
};

export type UpdateOrganizationForm = {
  name: string;
  image?: FileList | undefined;
};

export type UpdateOrganizationInput = {
  name: string;
  image?: File | undefined;
};
