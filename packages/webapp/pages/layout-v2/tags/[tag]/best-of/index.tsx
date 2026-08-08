import TagArchiveIndexPage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../tags/[tag]/best-of';
import { withLayoutVariant } from '../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(TagArchiveIndexPage, 'v2');
