import request from 'graphql-request';
import { useContext, useMemo } from 'react';
import { useMutation, useQuery } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import {
  DeviceNotificationPreference,
  DevicePreferenceData,
  DEVICE_PREFERENCE_QUERY,
  GeneralNotificationPreference,
  GeneralPreferenceData,
  GENERAL_PREFERENCE_QUERY,
  UPDATE_DEVICE_PREFERENCE_MUTATION,
  UPDATE_GENERAL_PREFERENCE_MUTATION,
} from '../graphql/notifications';
import { apiUrl } from '../lib/config';

type DeviceNotification = Omit<
  DeviceNotificationPreference,
  'deviceId' | 'description'
>;

interface UseNotificationPreferences {
  updateGeneralPreference: (
    data: GeneralNotificationPreference,
  ) => Promise<GeneralNotificationPreference>;
  updateDevicePreference: (
    data: DeviceNotification,
  ) => Promise<DeviceNotification>;
  generalPreference: GeneralNotificationPreference;
  devicePreference: DeviceNotification;
}

export const useNotificationPreferences = (): UseNotificationPreferences => {
  const { user, visit } = useContext(AuthContext);
  const { data: generalData, refetch: refetchGeneralData } = useQuery(
    ['general_preferences', user.id],
    () =>
      request<GeneralPreferenceData>(
        `${apiUrl}/graphql`,
        GENERAL_PREFERENCE_QUERY,
      ),
  );
  const { mutateAsync: updateGeneralPreference } = useMutation(
    (data: GeneralNotificationPreference) =>
      request(`${apiUrl}/graphql`, UPDATE_GENERAL_PREFERENCE_MUTATION, {
        data,
      }),
    { onSuccess: refetchGeneralData },
  );

  const { data: deviceData, refetch: refetchDeviceData } = useQuery(
    ['device_preferences', visit.sessionId],
    () =>
      request<DevicePreferenceData>(
        `${apiUrl}/graphql`,
        DEVICE_PREFERENCE_QUERY,
        { deviceId: visit.sessionId },
      ),
  );
  const { mutateAsync: updateDevicePreference } = useMutation(
    (data: Omit<DeviceNotificationPreference, 'deviceId' | 'description'>) =>
      request(`${apiUrl}/graphql`, UPDATE_DEVICE_PREFERENCE_MUTATION, {
        data,
        deviceId: visit.sessionId,
      }),
    { onSuccess: refetchDeviceData },
  );

  return useMemo(
    () => ({
      generalPreference: generalData?.preference ?? {},
      devicePreference: deviceData?.preference ?? {},
      updateGeneralPreference,
      updateDevicePreference,
    }),
    [generalData, deviceData],
  );
};
