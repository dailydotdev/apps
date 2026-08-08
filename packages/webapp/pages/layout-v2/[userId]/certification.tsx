import CertificationsPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/certification';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(CertificationsPage, 'v2');
