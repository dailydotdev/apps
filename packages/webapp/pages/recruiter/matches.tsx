import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { ConnectHeader } from '@dailydotdev/shared/src/components/recruiter/ConnectHeader';
import { ConnectProgress } from '@dailydotdev/shared/src/components/recruiter/ConnectProgress';
import type { ScreeningQuestion } from '@dailydotdev/shared/src/components/recruiter/ScreeningQuestions';
import { ScreeningQuestions } from '@dailydotdev/shared/src/components/recruiter/ScreeningQuestions';
import type { EngagementProfileData } from '@dailydotdev/shared/src/components/recruiter/EngagementProfile';
import { EngagementProfile } from '@dailydotdev/shared/src/components/recruiter/EngagementProfile';
import { MatchReviewHeader } from '@dailydotdev/shared/src/components/recruiter/MatchReviewHeader';
import type { MatchProfileDetails } from '@dailydotdev/shared/src/components/recruiter/MatchProfile';
import { MatchProfile } from '@dailydotdev/shared/src/components/recruiter/MatchProfile';
import { MatchInsights } from '@dailydotdev/shared/src/components/recruiter/MatchInsights';
import { getLayout } from '../../components/layouts/RecruiterSelfServeLayout';

// Mock data - replace with actual data from API
const mockMatches = [
  {
    id: '1',
    profile: {
      name: 'Leo Ekstrom Bothman',
      profileImage: 'https://i.pravatar.cc/150?img=1',
      profileLink: 'https://app.daily.dev/leoekstrom',
      seniority: 'Senior',
      location: 'Stockholm, Sweden',
      openToWork: true,
      company: {
        name: 'Spotify',
        favicon: 'https://www.google.com/s2/favicons?domain=spotify.com',
      },
      yearsOfExperience: '8 years',
    } as MatchProfileDetails,
    insights: [
      'Strong expertise in React and TypeScript, matching your tech stack requirements',
      'Active contributor to open-source projects with 500+ GitHub contributions',
      'Currently working on scalable web applications at Spotify',
      'Located in Stockholm with open-to-work status',
    ],
    screeningQuestions: [
      {
        question: 'What is your preferred work arrangement?',
        answer:
          'I prefer a hybrid work arrangement with 2-3 days in the office and the rest remote. This allows me to maintain a good work-life balance while still collaborating effectively with the team.',
      },
      {
        question: 'Describe your experience with React and TypeScript',
        answer:
          'I have been working with React and TypeScript for over 5 years, building large-scale applications. At Spotify, I architected and maintained several microservices using these technologies, focusing on performance optimization and developer experience.',
      },
      {
        question: 'What is your salary expectation?',
        answer:
          'I am looking for a competitive package in the range of €80,000 - €100,000 annually, depending on the benefits and growth opportunities.',
      },
    ] as ScreeningQuestion[],
    engagement: {
      topTags: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      recentlyRead: [
        'Building Scalable React Applications',
        'Advanced TypeScript Patterns',
        'Microservices Architecture Best Practices',
      ],
      activeSquads: ['Frontend Developers', 'TypeScript Community', 'React'],
      lastActive: '2 hours ago',
      profileSummary:
        'A passionate full-stack developer with extensive experience in building scalable web applications. Strong focus on code quality, performance optimization, and mentoring junior developers. Active in the developer community through open-source contributions and technical writing.',
    } as EngagementProfileData,
  },
];

function RecruiterMatchesPage(): ReactElement {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const currentMatch = mockMatches[currentMatchIndex];
  const totalMatches = mockMatches.length;

  const handleReject = () => {
    // TODO: Implement reject logic
    if (currentMatchIndex < totalMatches - 1) {
      setCurrentMatchIndex((prev) => prev + 1);
    }
  };

  const handleApprove = () => {
    // TODO: Implement approve logic
    if (currentMatchIndex < totalMatches - 1) {
      setCurrentMatchIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <ConnectHeader />
      <ConnectProgress />
      <div className="flex flex-1 flex-col bg-background-subtle p-6">
        <div className="flex max-w-full flex-shrink flex-col rounded-16 border border-border-subtlest-tertiary bg-surface-invert">
          <MatchReviewHeader
            currentMatch={currentMatchIndex + 1}
            totalMatches={totalMatches}
            name={currentMatch.profile.name}
            onReject={handleReject}
            onApprove={handleApprove}
          />
          <div className="flex gap-8 p-6">
            <div className="flex flex-1 flex-col gap-6">
              <MatchProfile profile={currentMatch.profile} />
              <MatchInsights reasons={currentMatch.insights} />
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <ScreeningQuestions questions={currentMatch.screeningQuestions} />
            </div>
          </div>
          <EngagementProfile engagement={currentMatch.engagement} />
        </div>
      </div>
    </div>
  );
}

RecruiterMatchesPage.getLayout = getLayout;

export default RecruiterMatchesPage;
