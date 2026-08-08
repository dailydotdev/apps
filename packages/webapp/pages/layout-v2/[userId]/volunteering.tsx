import VolunteeringPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/volunteering';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(VolunteeringPage, 'v2');
