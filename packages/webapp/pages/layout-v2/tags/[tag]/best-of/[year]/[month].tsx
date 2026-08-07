import TagMonthlyArchivePage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../../tags/[tag]/best-of/[year]/[month]';
import { withLayoutVariant } from '../../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(TagMonthlyArchivePage, 'v2');
