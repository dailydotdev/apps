import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
  GivebackCampaign,
  GivebackLevel,
  GivebackUserProfile,
} from './types';
import {
  createMockCampaign,
  createMockUserProfile,
  givebackLevels,
} from './mock';

export interface GivebackContextValue {
  campaign: GivebackCampaign;
  levels: GivebackLevel[];
  userProfile: GivebackUserProfile;
  // Dev review controls (Phase 1). The full QA panel lands in a later phase.
  goalPercentage: number;
  setGoalPercentage: (percentage: number) => void;
  userLevel: number;
  setUserLevel: (level: number) => void;
}

const GivebackContext = createContext<GivebackContextValue | undefined>(
  undefined,
);

const baseCampaign = createMockCampaign();
const baseProfile = createMockUserProfile();

const DEFAULT_GOAL_PERCENTAGE = Math.round(
  (baseCampaign.approvedAmount / baseCampaign.goalAmount) * 100,
);

interface GivebackProviderProps {
  children: ReactNode;
}

export const GivebackProvider = ({
  children,
}: GivebackProviderProps): ReactElement => {
  const [goalPercentage, setGoalPercentage] = useState(DEFAULT_GOAL_PERCENTAGE);
  const [userLevel, setUserLevel] = useState(baseProfile.currentLevel);

  const value = useMemo<GivebackContextValue>(() => {
    const approvedAmount = Math.round(
      (baseCampaign.goalAmount * goalPercentage) / 100,
    );
    const campaign: GivebackCampaign = {
      ...baseCampaign,
      approvedAmount,
    };

    const activeLevel =
      givebackLevels.find((level) => level.levelNumber === userLevel) ??
      givebackLevels[0];

    const userProfile: GivebackUserProfile = {
      ...baseProfile,
      currentLevel: activeLevel.levelNumber,
      approvedContributionAmount: activeLevel.requiredApprovedAmount,
    };

    return {
      campaign,
      levels: givebackLevels,
      userProfile,
      goalPercentage,
      setGoalPercentage,
      userLevel,
      setUserLevel,
    };
  }, [goalPercentage, userLevel]);

  return (
    <GivebackContext.Provider value={value}>
      {children}
    </GivebackContext.Provider>
  );
};

export const useGivebackContext = (): GivebackContextValue => {
  const context = useContext(GivebackContext);

  if (!context) {
    throw new Error(
      'useGivebackContext must be used within a GivebackProvider',
    );
  }

  return context;
};
