import SourceArchiveIndexPage, {
  getStaticPaths,
  getStaticProps,
} from '../../../../sources/[source]/best-of';
import { withLayoutVariant } from '../../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(SourceArchiveIndexPage, 'v2');
