import { withExperiment } from '../withExperiment';
import { DateFormat, DateFormatExperiment } from './DateFormat';
import { feature } from '../../lib/featureManagement';
import { PublishTimeFormat } from '../../lib/featureValues';

export * from './common';
export * from './Divider';
export * from './SelectableLink';

const DateFormatWithExperiment = withExperiment(DateFormatExperiment, {
  feature: feature.publishTimeFormat,
  value: PublishTimeFormat.V1,
  fallback: DateFormat,
});

export { DateFormatWithExperiment as DateFormat };
