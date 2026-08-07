import GlobalMonthlyArchivePage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../posts/best-of/[year]/[month]';
import { withLayoutVariant } from '../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(GlobalMonthlyArchivePage, 'v2');
