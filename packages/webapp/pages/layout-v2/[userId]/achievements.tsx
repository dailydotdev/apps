import ProfileAchievementsPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/achievements';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(ProfileAchievementsPage, 'v2');
