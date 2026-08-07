import TagYearlyArchivePage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../tags/[tag]/best-of/[year]';
import { withLayoutVariant } from '../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(TagYearlyArchivePage, 'v2');
