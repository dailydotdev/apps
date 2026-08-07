import EducationPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/education';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(EducationPage, 'v2');
