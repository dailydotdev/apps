import type { ReactElement } from 'react';
import {
  AfterCvUpload,
  AfterSavingJob,
  OthersBadge,
  ProfileHeaderChip,
  UnverifiedJob,
} from './places';
import type { Status } from './kit';

type Surface = (props: { onVerify: () => void }) => ReactElement;

export const entryPoints: Array<{
  id: string;
  title: string;
  where: string;
  status: Status;
  Surface: Surface;
}> = [
  {
    id: 'after-saving-job',
    title: '1. Right after saving a current job',
    where:
      'Saving a job takes you to Settings › Work Experience (no toast today). ExperienceSettings in the production settings page.',
    status: 'New',
    Surface: AfterSavingJob,
  },
  {
    id: 'unverified-job-row',
    title: '2. A row under the unverified job',
    where:
      'Your profile › Work Experiences (UserExperienceList). The "Verify company" chip is production and opens VerifyExperienceModal.',
    status: 'Restyle',
    Surface: UnverifiedJob,
  },
  {
    id: 'profile-header-chip',
    title: '3. "Add badge" chip in your profile header',
    where: 'ProfileHeader on your own profile.',
    status: 'New',
    Surface: ProfileHeaderChip,
  },
  {
    id: 'after-cv-upload',
    title: '4. Next step after a CV upload',
    where:
      'The “CV uploaded” ActionSuccessModal, with a “Next: show where you work” row in its body slot.',
    status: 'New',
    Surface: AfterCvUpload,
  },
  {
    id: 'others-badge',
    title: '5. Clicking someone else’s company badge',
    where:
      'VerifiedCompanyUserBadge in UserShortInfo. Today it has no click action, and its tooltip tells unverified viewers to use account settings.',
    status: 'New',
    Surface: OthersBadge,
  },
];
