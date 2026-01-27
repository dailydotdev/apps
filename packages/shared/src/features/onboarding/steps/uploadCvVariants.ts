export interface UploadCvVariant {
  headline: string;
  description: string;
}

export const uploadCvVariants: Record<number, UploadCvVariant> = {
  1: {
    // Control - uses existing copy from step parameters (no override)
    headline: '',
    description: '',
  },
  2: {
    headline: 'Get matched with jobs that fit your skills',
    description:
      "Upload your CV and we'll surface relevant opportunities from companies hiring developers like you. No searching required.",
  },
  3: {
    headline: 'Let opportunities find you',
    description:
      "Your CV helps us show you relevant roles while you browse your feed. Great jobs, zero effort — we'll notify you when something matches.",
  },
};

export const DEFAULT_VARIANT = 1;
