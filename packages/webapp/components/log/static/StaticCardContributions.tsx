import type { ReactElement } from 'react';
import React from 'react';
import {
  DiscussIcon,
  EyeIcon,
  ReputationIcon,
  EditIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    | 'postsCreated'
    | 'totalViews'
    | 'commentsReceived'
    | 'upvotesReceived'
    | 'reputationEarned'
    | 'creatorPercentile'
  >;
}

/**
 * Static Contributions card for share image generation.
 * Shows content creation stats with spotlight + ticket stub design.
 */
export default function StaticCardContributions({
  data,
}: StaticCardProps): ReactElement {
  return (
    <div className={styles.contributionsContainer}>
      {/* Creator badge header */}
      <div className={styles.creatorBadge}>
        <EditIcon size={IconSize.Medium} className={styles.creatorBadgeIcon} />
        <span className={styles.creatorBadgeText}>Content Creator</span>
      </div>

      {/* Main spotlight - Posts created */}
      <div className={styles.spotlightContainer}>
        <div className={styles.spotlightRing} />
        <div className={styles.spotlightInner}>
          <span className={styles.spotlightNumber}>
            {data.postsCreated || 0}
          </span>
          <span className={styles.spotlightLabel}>POSTS</span>
          <span className={styles.spotlightSubLabel}>published</span>
        </div>
      </div>

      {/* Result indicator - connects posts to impact */}
      <div className={styles.resultIndicator}>
        <div className={styles.resultLine} />
        <span className={styles.resultText}>resulted in</span>
        <div className={styles.resultLine} />
      </div>

      {/* Impact metrics as ticket stubs */}
      <div className={styles.ticketStubsContainer}>
        <div className={`${styles.ticketStub} ${styles.ticketStubViews}`}>
          <div className={styles.ticketStubPerforation} />
          <div className={styles.ticketStubContent}>
            <EyeIcon size={IconSize.Large} className={styles.ticketStubIcon} />
            <span className={styles.ticketStubValue}>
              {largeNumberFormat(data.totalViews || 0)}
            </span>
            <span className={styles.ticketStubLabel}>Views</span>
          </div>
          <div className={styles.ticketStubTear} />
        </div>

        <div className={`${styles.ticketStub} ${styles.ticketStubComments}`}>
          <div className={styles.ticketStubPerforation} />
          <div className={styles.ticketStubContent}>
            <DiscussIcon
              size={IconSize.Large}
              className={styles.ticketStubIcon}
            />
            <span className={styles.ticketStubValue}>
              {largeNumberFormat(data.commentsReceived || 0)}
            </span>
            <span className={styles.ticketStubLabel}>Comments</span>
          </div>
          <div className={styles.ticketStubTear} />
        </div>

        <div className={`${styles.ticketStub} ${styles.ticketStubRep}`}>
          <div className={styles.ticketStubPerforation} />
          <div className={styles.ticketStubContent}>
            <ReputationIcon
              size={IconSize.Large}
              className={styles.ticketStubIcon}
            />
            <span className={styles.ticketStubValue}>
              {largeNumberFormat(data.reputationEarned || 0)}
            </span>
            <span className={styles.ticketStubLabel}>Reputation</span>
          </div>
          <div className={styles.ticketStubTear} />
        </div>
      </div>

      {/* Creator ranking banner */}
      {data.creatorPercentile && (
        <div className={styles.celebrationBanner}>
          <div className={styles.bannerBg} />
          <div className={styles.bannerContent}>
            <span className={styles.bannerPre}>Top</span>
            <span className={styles.bannerMain}>{data.creatorPercentile}%</span>
            <span className={styles.bannerPost}>creator</span>
          </div>
        </div>
      )}
    </div>
  );
}
