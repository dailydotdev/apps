import ProfileCommentsPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/replies';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(ProfileCommentsPage, 'v2');
