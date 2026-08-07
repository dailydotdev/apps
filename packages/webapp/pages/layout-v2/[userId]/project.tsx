import ProjectsPage, {
  getStaticPaths,
  getStaticProps,
} from '../../[userId]/project';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(ProjectsPage, 'v2');
