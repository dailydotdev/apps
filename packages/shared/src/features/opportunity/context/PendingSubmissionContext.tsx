import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PendingSubmissionUrl {
  type: 'url';
  url: string;
}

export interface PendingSubmissionFile {
  type: 'file';
  file: File;
}

export type PendingSubmission = PendingSubmissionUrl | PendingSubmissionFile;

interface PendingSubmissionContextType {
  pendingSubmission: PendingSubmission | null;
  setPendingSubmission: (submission: PendingSubmission) => void;
  clearPendingSubmission: () => void;
}

const PendingSubmissionContext =
  createContext<PendingSubmissionContextType | null>(null);

export const PendingSubmissionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
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

  return (
    <PendingSubmissionContext.Provider
      value={{
        pendingSubmission,
        setPendingSubmission,
        clearPendingSubmission,
      }}
    >
      {children}
    </PendingSubmissionContext.Provider>
  );
};

export const usePendingSubmission = (): PendingSubmissionContextType => {
  const context = useContext(PendingSubmissionContext);
  if (!context) {
    throw new Error(
      'usePendingSubmission must be used within PendingSubmissionProvider',
    );
  }
  return context;
};

