import ProfilePostsPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/posts';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(ProfilePostsPage, 'v2');
