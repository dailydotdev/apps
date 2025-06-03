import type { SubscriptionStatus } from '../../lib/plus';
import type { LoggedUser, PublicProfile } from '../../lib/user';

export enum OrganizationMemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export enum OrganizationMemberSeatType {
  Free = 'free',
  Plus = 'plus',
}

export type OrganizationMember = {
  role: OrganizationMemberRole;
  seatType: OrganizationMemberSeatType;
  user: PublicProfile | LoggedUser;
  lastActive: Date | null;
};

export type Organization = {
  id: string;
  name: string;
  image?: string;
  seats?: number;
  activeSeats?: number;
  members?: OrganizationMember[];
  status?: SubscriptionStatus;
};

export type UserOrganization = {
  role: OrganizationMemberRole;
  seatType: OrganizationMemberSeatType;
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
