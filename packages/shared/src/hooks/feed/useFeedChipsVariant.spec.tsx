import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { useFeedChipsVariant } from './useFeedChipsVariant';
import { FeedChipsVariant } from '../../lib/featureManagement';
import { TagChipSeedStrategy } from '../../graphql/feed';

jest.mock('../useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockedUseConditionalFeature = useConditionalFeature as jest.Mock;
const mockedUseAuthContext = useAuthContext as jest.Mock;

describe('useFeedChipsVariant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuthContext.mockReturnValue({ user: { id: '1' } });
  });

  const renderForVariant = (variant: FeedChipsVariant) => {
    mockedUseConditionalFeature.mockReturnValue({
      value: variant,
      isLoading: false,
    });

    return renderHook(() => useFeedChipsVariant()).result.current;
  };

  it('opts out of tag chip feeds entirely for the control variant', () => {
    expect(renderForVariant(FeedChipsVariant.None)).toMatchObject({
      hasTagChipFeeds: false,
      tagChipSeedStrategy: TagChipSeedStrategy.V2,
    });
  });

  it('seeds single-tag feeds for V2', () => {
    expect(renderForVariant(FeedChipsVariant.V2)).toMatchObject({
      hasTagChipFeeds: true,
      tagChipSeedStrategy: TagChipSeedStrategy.V2,
    });
  });

  it('seeds clustered topics for V3', () => {
    expect(renderForVariant(FeedChipsVariant.V3)).toMatchObject({
      hasTagChipFeeds: true,
      tagChipSeedStrategy: TagChipSeedStrategy.V3,
    });
  });
});
