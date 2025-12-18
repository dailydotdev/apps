import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import type { LogData } from '../../types/log';
import {
  LogImageWrapper,
  StaticCardTotalImpact,
  StaticCardWhenYouRead,
  StaticCardTopicEvolution,
  StaticCardFavoriteSources,
  StaticCardCommunityEngagement,
  StaticCardContributions,
  StaticCardRecords,
  StaticCardArchetypeReveal,
  StaticCardShare,
} from '../../components/log/static';
import { ARCHETYPES } from '../../types/log';

/** User profile data included in share images */
interface UserProfile {
  image?: string;
  username?: string;
}

/**
 * Image generator page for Log share images.
 * Decodes base64url data from query params and renders the appropriate static card.
 *
 * URL format: /image-generator/log?card=total-impact&data=base64EncodedData
 * Data includes both log stats and user profile (image, username)
 */
export default function LogImagePage(): ReactElement {
  const { query } = useRouter();
  const { card, data: encodedData } = query;

  // Decode base64url data (includes both log data and user profile)
  const { logData, userProfile } = useMemo<{
    logData: Partial<LogData> | null;
    userProfile: UserProfile;
  }>(() => {
    if (!encodedData || typeof encodedData !== 'string') {
      return { logData: null, userProfile: {} };
    }

    try {
      // Decode base64url (handle both base64 and base64url)
      const base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      const parsed = JSON.parse(decoded);

      // Extract user profile from the payload
      const { userImage, username, ...rest } = parsed;
      return {
        logData: rest,
        userProfile: { image: userImage, username },
      };
    } catch {
      return { logData: null, userProfile: {} };
    }
  }, [encodedData]);

  // Get archetype color for themed backgrounds
  const archetypeColor = useMemo(() => {
    if (logData?.archetype && ARCHETYPES[logData.archetype]) {
      return ARCHETYPES[logData.archetype].color;
    }
    return undefined;
  }, [logData?.archetype]);

  // Render appropriate card based on card type
  const renderCard = () => {
    if (!logData) {
      return (
        <div style={{ color: 'white', fontSize: 48, textAlign: 'center' }}>
          No data provided
        </div>
      );
    }

    switch (card) {
      case 'total-impact':
        return (
          <StaticCardTotalImpact
            data={{
              totalPosts: logData.totalPosts ?? 0,
              totalReadingTime: logData.totalReadingTime ?? 0,
              daysActive: logData.daysActive ?? 0,
              totalImpactPercentile: logData.totalImpactPercentile ?? 50,
            }}
          />
        );

      case 'when-you-read':
        return (
          <StaticCardWhenYouRead
            data={{
              peakDay: logData.peakDay ?? 'Monday',
              readingPattern: logData.readingPattern ?? 'afternoon',
              patternPercentile: logData.patternPercentile ?? 50,
              activityHeatmap: logData.activityHeatmap ?? [],
            }}
          />
        );

      case 'topic-evolution':
        return (
          <StaticCardTopicEvolution
            data={{
              topicJourney: logData.topicJourney ?? [],
              uniqueTopics: logData.uniqueTopics ?? 0,
              evolutionPercentile: logData.evolutionPercentile ?? 50,
            }}
          />
        );

      case 'favorite-sources':
        return (
          <StaticCardFavoriteSources
            data={{
              topSources: logData.topSources ?? [
                { name: '', postsRead: 0, logoUrl: '' },
                { name: '', postsRead: 0, logoUrl: '' },
                { name: '', postsRead: 0, logoUrl: '' },
              ],
              uniqueSources: logData.uniqueSources ?? 0,
              sourcePercentile: logData.sourcePercentile ?? 50,
              sourceLoyaltyName: logData.sourceLoyaltyName ?? '',
            }}
          />
        );

      case 'community':
        return (
          <StaticCardCommunityEngagement
            data={{
              upvotesGiven: logData.upvotesGiven ?? 0,
              commentsWritten: logData.commentsWritten ?? 0,
              postsBookmarked: logData.postsBookmarked ?? 0,
              upvotePercentile: logData.upvotePercentile,
              commentPercentile: logData.commentPercentile,
              bookmarkPercentile: logData.bookmarkPercentile,
            }}
          />
        );

      case 'contributions':
        return (
          <StaticCardContributions
            data={{
              postsCreated: logData.postsCreated,
              totalViews: logData.totalViews,
              commentsReceived: logData.commentsReceived,
              upvotesReceived: logData.upvotesReceived,
              reputationEarned: logData.reputationEarned,
              creatorPercentile: logData.creatorPercentile,
            }}
          />
        );

      case 'records':
        return (
          <StaticCardRecords
            data={{
              records: logData.records ?? [],
            }}
          />
        );

      case 'archetype':
        return (
          <StaticCardArchetypeReveal
            data={{
              archetype: logData.archetype ?? 'SCHOLAR',
              archetypeStat: logData.archetypeStat ?? '',
              archetypePercentile: logData.archetypePercentile ?? 50,
            }}
          />
        );

      case 'share':
        return (
          <StaticCardShare
            data={{
              archetype: logData.archetype ?? 'SCHOLAR',
              archetypeStat: logData.archetypeStat ?? '',
              totalPosts: logData.totalPosts ?? 0,
              daysActive: logData.daysActive ?? 0,
              records: logData.records ?? [],
            }}
          />
        );

      default:
        return (
          <div style={{ color: 'white', fontSize: 48, textAlign: 'center' }}>
            Unknown card type: {card}
          </div>
        );
    }
  };

  return (
    <div id="screenshot_wrapper" style={{ width: 'fit-content' }}>
      <LogImageWrapper
        archetypeColor={archetypeColor}
        userImage={userProfile.image}
        username={userProfile.username}
      >
        {renderCard()}
      </LogImageWrapper>
    </div>
  );
}

// Disable the default layout for this page
LogImagePage.getLayout = (page: ReactElement) => page;
