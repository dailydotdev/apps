import type { OpportunityMatch } from './types';
import type { MatchProfileDetails } from '../../components/recruiter/MatchProfile';
import type { EngagementProfileData } from '../../components/recruiter/EngagementProfile';

export const mapMatchToProfile = (
  match: OpportunityMatch,
): MatchProfileDetails => {
  return {
    name: match.user.name,
    profileImage: match.user.image,
    profileLink: match.user.permalink,
    reputation: match.user.reputation,
    seniority: match.previewUser?.seniority || 'Not specified',
    location: match.previewUser?.location || 'Not specified',
    openToWork: match.previewUser?.openToWork ?? true,
    company: match.previewUser?.company || { name: 'Not specified' },
    lastActivity: match.previewUser?.lastActivity,
  };
};

export const mapMatchToEngagement = (
  match: OpportunityMatch,
): EngagementProfileData => {
  return {
    topTags: match.previewUser?.topTags ?? [],
    recentlyRead: match.previewUser?.recentlyRead ?? [],
    activeSquads: match.previewUser?.activeSquads ?? [],
    profileSummary: match.engagementProfile?.profileText || '',
  };
};

export const mapMatchToScreeningQuestions = (match: OpportunityMatch) => {
  return match.screening.map((s) => ({
    question: s.screening,
    answer: s.answer,
  }));
};
