import GlobalArchiveIndexPage, { getStaticProps } from '../../../posts/best-of';
import { withLayoutVariant } from '../../../../lib/layoutVariantPage';

export { getStaticProps };
export default withLayoutVariant(GlobalArchiveIndexPage, 'v2');
