import React, { ReactElement, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { PageSidebar } from '@dailydotdev/shared/src/components/utilities';
import FeatherIcon from '@dailydotdev/shared/icons/feather.svg';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ownershipGuide } from '@dailydotdev/shared/src/lib/constants';
import { ShareMobile } from '@dailydotdev/shared/src/components/ShareMobile';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import classNames from 'classnames';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { PostData } from '@dailydotdev/shared/src/graphql/posts';
import styles from './PostSidebar.module.css';

const ShareBar = dynamic(
  () => import('@dailydotdev/shared/src/components/ShareBar'),
  {
    ssr: false,
  },
);

const FurtherReading = dynamic(
  () =>
    import(
      /* webpackChunkName: "furtherReading" */ '../widgets/FurtherReading'
    ),
);

interface PostSidebarProps {
  postById: PostData;
}

export default function PostSidebar({
  postById,
}: PostSidebarProps): ReactElement {
  const router = useRouter();
  const [authorOnboarding, setAuthorOnboarding] = useState(false);
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  useEffect(() => {
    if (router?.query.author) {
      setAuthorOnboarding(true);
    }
  }, [router.query?.author]);

  const sharePost = async () => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: postById.post.title,
          url: postById.post.commentsPermalink,
        });
        trackEvent(
          postAnalyticsEvent('share post', postById.post, {
            extra: { origin: 'article page' },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    }
  };

  return (
    <PageSidebar>
      {authorOnboarding ? (
        <section
          className={classNames(
            'p-6 bg-theme-bg-secondary rounded-2xl',
            styles.authorOnboarding,
          )}
        >
          <div
            className={classNames(
              'grid items-center gap-x-3',
              styles.authorOnboardingHeader,
            )}
            style={{ gridTemplateColumns: 'repeat(2, max-content)' }}
          >
            <FeatherIcon />
            <h3>Author</h3>
            <h2>Is this article yours?</h2>
          </div>
          <p>Claim ownership and get the following perks:</p>
          <ol>
            <li>
              Get notified when your articles are picked by daily.dev feed
            </li>
            <li>Exclusive author badge on your comments</li>
            <li>Analytics report for every post you wrote</li>
            <li>
              Gain reputation points by earning upvotes on articles you wrote
            </li>
          </ol>
          <div
            className="grid grid-flow-col gap-x-4 mt-6"
            data-testid="authorOnboarding"
            style={{
              maxWidth: sizeN(74),
              gridTemplateColumns: '1fr max-content',
            }}
          >
            {!user && (
              <Button
                className="btn-primary"
                onClick={() => showLogin('author')}
              >
                Sign up
              </Button>
            )}
            <Button
              className="btn-secondary"
              tag="a"
              href={ownershipGuide}
              target="_blank"
              rel="noopener"
            >
              Learn more
            </Button>
          </div>
        </section>
      ) : (
        <>
          {postById && <ShareBar post={postById.post} />}
          <ShareMobile share={sharePost} />
          {postById?.post && tokenRefreshed && (
            <FurtherReading
              currentPost={postById.post}
              className="laptopL:w-[19.5rem]"
            />
          )}
        </>
      )}
    </PageSidebar>
  );
}
