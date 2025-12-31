import { useState, useCallback } from 'react';
import { createContextProvider } from '@kickass-coderz/react';

export interface PendingSubmissionUrl {
  type: 'url';
  url: string;
}

export interface PendingSubmissionFile {
  type: 'file';
  file: File;
}

export type PendingSubmission = PendingSubmissionUrl | PendingSubmissionFile;

const [PendingSubmissionProvider, usePendingSubmission] = createContextProvider(
  () => {
    const [pendingSubmission, setPendingSubmissionState] =
      useState<PendingSubmission | null>(null);

    const setPendingSubmission = useCallback(
      (submission: PendingSubmission) => {
        setPendingSubmissionState(submission);
      },
      [],
    );

    const clearPendingSubmission = useCallback(() => {
      setPendingSubmissionState(null);
    }, []);

    return {
      pendingSubmission,
      setPendingSubmission,
      clearPendingSubmission,
    };
  },
  {
    scope: 'PendingSubmissionProvider',
  },
);

export { PendingSubmissionProvider, usePendingSubmission };
