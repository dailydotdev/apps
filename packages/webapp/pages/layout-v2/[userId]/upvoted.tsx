import ProfileUpvotedPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/upvoted';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(ProfileUpvotedPage, 'v2');
