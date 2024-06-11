import { useEffect, useState } from 'react';
import { get as getCache, set as setCache } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device_id';

export const getOrGenerateDeviceId = async (): Promise<string> => {
  const deviceId = await getCache<string | undefined>(DEVICE_ID_KEY);
  if (deviceId) {
    return deviceId;
  }
  const newDeviceId = uuidv4();
  await setCache(DEVICE_ID_KEY, newDeviceId);
  return newDeviceId;
};

export default function useDeviceId(): string {
  const [deviceId, setDeviceId] = useState<string>();

  useEffect(() => {
    getOrGenerateDeviceId().then((_deviceId) => setDeviceId(_deviceId));
  }, []);

  return deviceId;
}
