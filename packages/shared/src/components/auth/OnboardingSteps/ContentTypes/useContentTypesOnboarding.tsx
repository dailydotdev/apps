// TODO: move in right directory if the onboardingContentType experiment is successful
import { useAdvancedSettings } from '../../../../hooks';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import { AdvancedSettings } from '../../../../graphql/feedSettings';

interface UseContentTypesOnboardingReturn {
  contentTypeNotEmpty: boolean;
  advancedSettingsExceptCommunity: AdvancedSettings[];
}
export const useContentTypesOnboarding =
  (): UseContentTypesOnboardingReturn => {
    const { contentSourceList, contentCurationList, videoSetting } =
      useFeedSettings();
    const { selectedSettings, checkSourceBlocked } = useAdvancedSettings();

    const advancedSettingsExceptCommunity = [...contentCurationList];

    if (videoSetting) {
      advancedSettingsExceptCommunity.push(videoSetting);
    }
    const advancedSettingsExceptCommunitySelected =
      !!advancedSettingsExceptCommunity
        .map(({ id, defaultEnabledState }) => {
          return selectedSettings[id] ?? defaultEnabledState;
        })
        .find((setting) => setting === true);

    const sourceCommunitySelected = !!contentSourceList
      .map(({ options }) => options.source)
      .find((source) => !checkSourceBlocked(source));

    const contentTypeNotEmpty =
      advancedSettingsExceptCommunitySelected || sourceCommunitySelected;

    return { contentTypeNotEmpty, advancedSettingsExceptCommunity };
  };
