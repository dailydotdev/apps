import GlobalYearlyArchivePage, {
  getStaticPaths,
  getStaticProps,
} from '../../../posts/best-of/[year]';
import { withLayoutVariant } from '../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(GlobalYearlyArchivePage, 'v2');
