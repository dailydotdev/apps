import { FeaturesData } from '../contexts/FeaturesContext';
import { FEATURES_STATE_KEY, FeaturesState } from './featureManagement';
import { useEffect, useState } from 'react';

export default function useFeatures(): FeaturesData {
  const [features, setFeatures] = useState<FeaturesState>();

  useEffect(() => {
    setFeatures(JSON.parse(localStorage.getItem(FEATURES_STATE_KEY)));
    const callback = (event: CustomEvent): void => setFeatures(event.detail);
    window.addEventListener('featuresLoaded', callback);
    return () => window.removeEventListener('featuresLoaded', callback);
  }, []);

  return {
    flags: features?.flags || {},
  };
}
