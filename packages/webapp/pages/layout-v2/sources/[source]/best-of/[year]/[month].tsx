import SourceMonthlyArchivePage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../../sources/[source]/best-of/[year]/[month]';
import { withLayoutVariant } from '../../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(SourceMonthlyArchivePage, 'v2');
