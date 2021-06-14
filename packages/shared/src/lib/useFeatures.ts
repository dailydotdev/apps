import { FeaturesData } from '../contexts/FeaturesContext';
import { FEATURES_STATE_KEY, FeaturesState } from './featureManagement';
import { useEffect, useState } from 'react';

export default function useFeatures(): FeaturesData {
  const [features, setFeatures] = useState<FeaturesState>();

  useEffect(() => {
    setFeatures(JSON.parse(localStorage.getItem(FEATURES_STATE_KEY)));
  }, []);

  return {
    flags: features?.flags || {},
  };
}
