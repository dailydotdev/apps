import { SeniorityLevel } from './protobuf/opportunity';

export const seniorityLevelMap = {
  [SeniorityLevel.UNSPECIFIED]: 'N/A',
  [SeniorityLevel.INTERN]: 'Intern',
  [SeniorityLevel.JUNIOR]: 'Junior',
  [SeniorityLevel.MID]: 'Mid',
  [SeniorityLevel.SENIOR]: 'Senior',
  [SeniorityLevel.LEAD]: 'Lead',
  [SeniorityLevel.MANAGER]: 'Manager',
  [SeniorityLevel.DIRECTOR]: 'Director',
  [SeniorityLevel.VP]: 'VP',
  [SeniorityLevel.C_LEVEL]: 'C-Level',
};
