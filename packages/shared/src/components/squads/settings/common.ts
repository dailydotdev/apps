import classed from '../../../lib/classed';

export const StatusDescription = classed(
  'p',
  'typo-subhead text-text-tertiary',
);

export enum SquadStatus {
  InProgress = 'in-progress',
  Pending = 'pending',
  Rejected = 'rejected',
  Approved = 'approved',
}
