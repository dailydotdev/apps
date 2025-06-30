import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};
const feedScrollPositions: Record<string, number> = {};
const navigationHistory: string[] = [];

export const useScrollRestoration = (): void => {
  const { pathname, asPath } = useRouter();
  const previousPath = useRef<string>('');
  const isInitialLoad = useRef<boolean>(true);

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions[pathname] = window.scrollY;
      
      // Store feed scroll position specifically for post navigation
      if (isFeedPage(pathname)) {
        feedScrollPositions[pathname] = window.scrollY;
        // Store in sessionStorage as backup for page refreshes
        try {
          sessionStorage.setItem(`feedScroll:${pathname}`, window.scrollY.toString());
        } catch (e) {
          // Silently fail if sessionStorage is not available
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    // Track navigation history
    if (!isInitialLoad.current) {
      navigationHistory.push(previousPath.current);
      // Keep only the last 5 entries to prevent memory leaks
      if (navigationHistory.length > 5) {
        navigationHistory.shift();
      }
    }

    // Determine scroll restoration strategy
    let targetScrollPosition = 0;
    
    // Check if we're navigating back from a post page to a feed page
    const isComingFromPost = previousPath.current.startsWith('/posts/');
    const isGoingToFeed = isFeedPage(pathname);
    
    // Also check if we have referrer information from the GoBack button
    let hasPostReferrer = false;
    try {
      const postReferrer = sessionStorage.getItem('postPageReferrer');
      if (postReferrer && isGoingToFeed) {
        hasPostReferrer = true;
        // Clean up the referrer information after use
        sessionStorage.removeItem('postPageReferrer');
      }
    } catch (e) {
      // Silently fail if sessionStorage is not available
    }
    
    if ((isComingFromPost && isGoingToFeed) || hasPostReferrer) {
      // Use the stored feed scroll position
      targetScrollPosition = feedScrollPositions[pathname] || 0;
      
      // Fallback to sessionStorage if in-memory position is not available
      if (targetScrollPosition === 0) {
        try {
          const storedPosition = sessionStorage.getItem(`feedScroll:${pathname}`);
          if (storedPosition) {
            targetScrollPosition = parseInt(storedPosition, 10);
          }
        } catch (e) {
          // Silently fail if sessionStorage is not available
        }
      }
    } else {
      // Use the regular scroll restoration
      targetScrollPosition = scrollPositions[pathname] || 0;
    }
    
    // Restore scroll position
    if (!isInitialLoad.current) {
      // Use requestAnimationFrame to ensure the page is fully loaded
      requestAnimationFrame(() => {
        window.scrollTo(0, targetScrollPosition);
      });
    }
    
    // Update previous path for next navigation
    previousPath.current = pathname;
    isInitialLoad.current = false;
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear old entries from sessionStorage to prevent memory leaks
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const keys = Object.keys(sessionStorage);
          keys.forEach(key => {
            if (key.startsWith('feedScroll:') && keys.length > 10) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (e) {
          // Silently fail if sessionStorage is not available
        }
      }
    };
  }, []);
};

// Helper function to determine if a path is a feed page
const isFeedPage = (pathname: string): boolean => {
  const feedPaths = [
    '/',
    '/popular',
    '/discussed',
    '/upvoted',
    '/my-feed',
    '/following',
    '/bookmarks',
    '/history',
    '/search',
    '/tags',
    '/sources',
    '/users',
    '/feeds',
  ];
  
  return feedPaths.some(feedPath => 
    pathname === feedPath || 
    pathname.startsWith(`${feedPath}/`) ||
    pathname.startsWith('/feeds/')
  );
};

export const useManualScrollRestoration = (): void => {
  useEffect(() => {
    if (typeof window.history?.scrollRestoration !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if (typeof window.history?.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);
};
