import SourceYearlyArchivePage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../sources/[source]/best-of/[year]';
import { withLayoutVariant } from '../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(SourceYearlyArchivePage, 'v2');
