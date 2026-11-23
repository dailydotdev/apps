import type { ReactElement } from 'react';
import {
  AfterCvUpload,
  AfterSavingJob,
  OthersBadge,
  ProfileHeaderChip,
  UnverifiedJobRow,
} from './surfaces';
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
    where: 'Settings › Experience, on save',
    status: 'New',
    Surface: AfterSavingJob,
  },
  {
    id: 'unverified-job-row',
    title: '2. A row under the unverified job',
    where:
      'Your profile › Experience. The "Verify company" chip is there today and opens VerifyExperienceModal.',
    status: 'Restyle',
    Surface: UnverifiedJobRow,
  },
  {
    id: 'profile-header-chip',
    title: '3. "Add badge" chip in your profile header',
    where: 'Your own profile, where a verified company would show',
    status: 'New',
    Surface: ProfileHeaderChip,
  },
  {
    id: 'after-cv-upload',
    title: '4. Next step after a CV upload',
    where: 'Profile, once the CV has filled in your jobs',
    status: 'New',
    Surface: AfterCvUpload,
  },
  {
    id: 'others-badge',
    title: '5. A button on someone else’s badge',
    where:
      'Any verified member’s company badge. Today a tooltip that says "via account settings".',
    status: 'New',
    Surface: OthersBadge,
  },
];
