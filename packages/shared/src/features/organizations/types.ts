import type { SubscriptionStatus } from '../../lib/plus';
import type { ProtoEnumValue } from '../../lib/protobuf';
import type { LoggedUser, PublicProfile } from '../../lib/user';
import type { TLocation } from '../../graphql/autocomplete';

export enum OrganizationMemberRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export enum OrganizationMemberSeatType {
  Free = 'free',
  Plus = 'plus',
}

export enum OrganizationLinkType {
  Custom = 'custom',
  Social = 'social',
  Press = 'press',
}

export enum SocialMediaType {
  Facebook = 'facebook',
  X = 'x',
  GitHub = 'github',
  Crunchbase = 'crunchbase',
  LinkedIn = 'linkedin',
}

export type OrganizationMember = {
  role: OrganizationMemberRole;
  seatType: OrganizationMemberSeatType;
  user: PublicProfile | LoggedUser;
  lastActive: Date | null;
};

type OrganizationLinkBase = {
  link: string;
};

export type OrganizationLink = OrganizationLinkBase & {
  type: OrganizationLinkType.Custom | OrganizationLinkType.Press;
  title?: string;
};

export type OrganizationSocialLink = OrganizationLinkBase & {
  type: OrganizationLinkType.Social;
  socialType: SocialMediaType;
};

export type Organization = {
  id: string;
  name: string;
  image?: string;
  seats?: number;
  activeSeats?: number;
  members?: OrganizationMember[];
  status?: SubscriptionStatus;

  website?: string;
  description?: string;
  perks?: Array<string>;
  founded?: number;
  location?: TLocation | null;
  externalLocationId?: string;
  category?: string;
  size?: ProtoEnumValue;
  stage?: ProtoEnumValue;

  customLinks?: OrganizationLink[];
  pressLinks?: OrganizationLink[];
  socialLinks?: OrganizationSocialLink[];
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
