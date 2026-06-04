import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
  GivebackAction,
  GivebackActionCategoryFilter,
  GivebackActionSubmissionInput,
  GivebackCampaign,
  GivebackCause,
  GivebackCauseSuggestionInput,
  GivebackCommunityEvent,
  GivebackDonationAccounting,
  GivebackLevel,
  GivebackUserAction,
  GivebackUserProfile,
} from './types';
import {
  GivebackActionValidationType,
  GivebackCauseStatus,
  GivebackUserActionStatus,
} from './types';
import {
  createMockCampaign,
  createMockUserProfile,
  givebackActions,
  givebackCauses,
  givebackCommunityEvents,
  givebackLevels,
  givebackUserActions,
} from './mock';

export interface GivebackContextValue {
  campaign: GivebackCampaign;
  levels: GivebackLevel[];
  userProfile: GivebackUserProfile;
  actions: GivebackAction[];
  filteredActions: GivebackAction[];
  loveActions: GivebackAction[];
  userActions: GivebackUserAction[];
  causes: GivebackCause[];
  suggestedCauses: GivebackCause[];
  communityEvents: GivebackCommunityEvent[];
  donationAccounting: GivebackDonationAccounting;
  submitAction: (input: GivebackActionSubmissionInput) => void;
  toggleCause: (causeId: string) => void;
  suggestCause: (input: GivebackCauseSuggestionInput) => void;
  setUserActionStatus: (
    actionId: string,
    status: GivebackUserActionStatus,
  ) => void;
  showCommunityFeed: boolean;
  setShowCommunityFeed: (value: boolean) => void;
  geoAvailability: 'available' | 'waitlist';
  setGeoAvailability: (value: 'available' | 'waitlist') => void;
  celebrationState: 'none' | 'milestone' | 'complete';
  setCelebrationState: (value: 'none' | 'milestone' | 'complete') => void;
  selectedCategory: GivebackActionCategoryFilter;
  setSelectedCategory: (category: GivebackActionCategoryFilter) => void;
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
const ACTIVE_CAUSES = givebackCauses.filter(
  ({ status }) => status === GivebackCauseStatus.Active,
);

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
  const [selectedCategory, setSelectedCategory] =
    useState<GivebackActionCategoryFilter>('all');
  const [userActions, setUserActions] =
    useState<GivebackUserAction[]>(givebackUserActions);
  const [selectedCauseIds, setSelectedCauseIds] = useState<string[]>(
    baseProfile.selectedCauseIds,
  );
  const [suggestedCauses, setSuggestedCauses] = useState<GivebackCause[]>([]);
  const [showCommunityFeed, setShowCommunityFeed] = useState(true);
  const [geoAvailability, setGeoAvailability] = useState<
    'available' | 'waitlist'
  >('available');
  const [celebrationState, setCelebrationState] = useState<
    'none' | 'milestone' | 'complete'
  >('none');

  const submitAction = ({
    actionId,
    evidenceLink,
    evidenceImage,
    note,
  }: GivebackActionSubmissionInput): void => {
    const action = givebackActions.find(({ id }) => id === actionId);

    if (!action) {
      throw new Error(`Giveback action ${actionId} does not exist`);
    }

    if (action.isLoveAction || !action.donationEligible) {
      throw new Error('Love actions cannot unlock donation value');
    }

    const status =
      action.validationType === GivebackActionValidationType.Automatic
        ? GivebackUserActionStatus.AutoValidating
        : GivebackUserActionStatus.PendingReview;

    setUserActions((currentActions) => {
      const nextAction: GivebackUserAction = {
        actionId,
        status,
        unlockedDonationAmount: action.donationAmount,
        pendingDonationAmount: action.donationAmount,
        approvedDonationAmount: 0,
        rejectedDonationAmount: 0,
        evidenceLink,
        evidenceImage,
        note,
        submittedAt: new Date().toISOString(),
      };
      const existingIndex = currentActions.findIndex(
        (userAction) => userAction.actionId === actionId,
      );

      if (existingIndex === -1) {
        return [...currentActions, nextAction];
      }

      return currentActions.map((userAction, index) =>
        index === existingIndex ? nextAction : userAction,
      );
    });
  };

  const toggleCause = (causeId: string): void => {
    setSelectedCauseIds((current) => {
      if (current.includes(causeId)) {
        return current.filter((id) => id !== causeId);
      }

      return [...current, causeId];
    });
  };

  const suggestCause = ({
    name,
    url,
    note,
    category,
  }: GivebackCauseSuggestionInput): void => {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName || !trimmedUrl) {
      return;
    }

    setSuggestedCauses((current) => [
      {
        id: `suggested-${Date.now().toString()}`,
        name: trimmedName,
        description:
          note?.trim() || 'Suggested by the community for future review.',
        url: trimmedUrl,
        category: category?.trim() || 'Community suggestion',
        status: GivebackCauseStatus.PendingReview,
        sortOrder: ACTIVE_CAUSES.length + current.length + 1,
      },
      ...current,
    ]);
  };

  const setUserActionStatus = (
    actionId: string,
    status: GivebackUserActionStatus,
  ): void => {
    const action = givebackActions.find(({ id }) => id === actionId);

    if (!action) {
      throw new Error(`Giveback action ${actionId} does not exist`);
    }

    setUserActions((currentActions) => {
      const existingAction = currentActions.find(
        (userAction) => userAction.actionId === actionId,
      );
      const nextAction: GivebackUserAction = {
        actionId,
        status,
        unlockedDonationAmount:
          status === GivebackUserActionStatus.NotStarted
            ? 0
            : action.donationAmount,
        pendingDonationAmount: [
          GivebackUserActionStatus.Submitted,
          GivebackUserActionStatus.PendingReview,
          GivebackUserActionStatus.AutoValidating,
        ].includes(status)
          ? action.donationAmount
          : 0,
        approvedDonationAmount: [
          GivebackUserActionStatus.Approved,
          GivebackUserActionStatus.CountedTowardGoal,
        ].includes(status)
          ? action.donationAmount
          : 0,
        rejectedDonationAmount:
          status === GivebackUserActionStatus.Rejected
            ? action.donationAmount
            : 0,
        submittedAt:
          existingAction?.submittedAt ??
          (status === GivebackUserActionStatus.NotStarted
            ? undefined
            : new Date().toISOString()),
        reviewedAt: [
          GivebackUserActionStatus.Approved,
          GivebackUserActionStatus.CountedTowardGoal,
          GivebackUserActionStatus.Rejected,
        ].includes(status)
          ? new Date().toISOString()
          : undefined,
        rejectionReason:
          status === GivebackUserActionStatus.Rejected
            ? 'Simulated rejection from the QA panel.'
            : undefined,
        needsMoreInfoReason:
          status === GivebackUserActionStatus.NeedsMoreInfo
            ? 'Simulated request for more proof from the QA panel.'
            : undefined,
      };
      const existingIndex = currentActions.findIndex(
        (userAction) => userAction.actionId === actionId,
      );

      if (existingIndex === -1) {
        return [...currentActions, nextAction];
      }

      return currentActions.map((userAction, index) =>
        index === existingIndex ? nextAction : userAction,
      );
    });
  };

  const value = useMemo<GivebackContextValue>(() => {
    const donationAccounting = userActions.reduce<GivebackDonationAccounting>(
      (sum, userAction) => ({
        unlockedDonationAmount:
          sum.unlockedDonationAmount + userAction.unlockedDonationAmount,
        pendingDonationAmount:
          sum.pendingDonationAmount + userAction.pendingDonationAmount,
        approvedDonationAmount:
          sum.approvedDonationAmount + userAction.approvedDonationAmount,
        rejectedDonationAmount:
          sum.rejectedDonationAmount + userAction.rejectedDonationAmount,
      }),
      {
        unlockedDonationAmount: 0,
        pendingDonationAmount: 0,
        approvedDonationAmount: 0,
        rejectedDonationAmount: 0,
      },
    );
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
      selectedCauseIds,
    };

    const donationActions = givebackActions.filter(
      (action) => !action.isLoveAction,
    );
    const loveActions = givebackActions.filter((action) => action.isLoveAction);

    const filteredActions = donationActions.filter(
      (action) =>
        selectedCategory === 'all' || action.category === selectedCategory,
    );

    return {
      campaign,
      levels: givebackLevels,
      userProfile,
      actions: donationActions,
      filteredActions,
      loveActions,
      userActions,
      causes: ACTIVE_CAUSES,
      suggestedCauses,
      communityEvents: showCommunityFeed ? givebackCommunityEvents : [],
      donationAccounting,
      submitAction,
      toggleCause,
      suggestCause,
      setUserActionStatus,
      showCommunityFeed,
      setShowCommunityFeed,
      geoAvailability,
      setGeoAvailability,
      celebrationState,
      setCelebrationState,
      selectedCategory,
      setSelectedCategory,
      goalPercentage,
      setGoalPercentage,
      userLevel,
      setUserLevel,
    };
  }, [
    goalPercentage,
    celebrationState,
    geoAvailability,
    selectedCategory,
    selectedCauseIds,
    showCommunityFeed,
    suggestedCauses,
    userActions,
    userLevel,
  ]);

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
