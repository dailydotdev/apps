export enum OrganizationMemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export type Organization = {
  id: string;
  name: string;
  image?: string;
  seats?: number;
};

export type UserOrganization = {
  role: OrganizationMemberRole;
  referralToken?: string;
  organization: Organization;
};
