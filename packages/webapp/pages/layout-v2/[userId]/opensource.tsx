import OpensourcePage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/opensource';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(OpensourcePage, 'v2');
