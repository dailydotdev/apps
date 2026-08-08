import WorkExperiencePage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/work';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(WorkExperiencePage, 'v2');
