import { useFeature } from '../../../components/GrowthBookProvider';
import { uploadCvFunnelVersion } from '../../../lib/featureManagement';
import type { UploadCvVariant } from '../steps/uploadCvVariants';
import { uploadCvVariants, DEFAULT_VARIANT } from '../steps/uploadCvVariants';

export function useUploadCvVariant(): UploadCvVariant {
  const version = useFeature(uploadCvFunnelVersion);
  return uploadCvVariants[version] ?? uploadCvVariants[DEFAULT_VARIANT];
}
