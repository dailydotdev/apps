import { SharedFeedPage } from '../../components/utilities';
import { isExtension } from '../../lib/func';
import useCustomDefaultFeed from './useCustomDefaultFeed';

type MyFeedNav = {
  path: string;
  // Feed key for the extension new tab, which swaps the feed in place instead
  // of routing — handed to the layout's `onNavTabClick`.
  navTab: string;
};

// Where "your feed" lives: the brand mark, the Home rail tab and the Home
// panel's first row all target it, so they resolve it through here.
export const useMyFeedNav = (): MyFeedNav => {
  const { isCustomDefaultFeed } = useCustomDefaultFeed();

  return {
    // The extension has no router, so the personal feed always needs its
    // explicit path rather than "/".
    path: isExtension || isCustomDefaultFeed ? '/my-feed' : '/',
    navTab: isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/',
  };
};
