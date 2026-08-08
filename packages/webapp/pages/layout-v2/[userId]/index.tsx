import ProfilePage, { getStaticPaths, getStaticProps } from '../../[userId]';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(ProfilePage, 'v2');
