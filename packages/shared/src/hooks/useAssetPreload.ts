import { useEffect } from 'react';

export enum AssetType {
  Image = 'image',
}

export const useAssetPreload = (type: AssetType, asset: string): void => {
  useEffect(() => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('href', asset);
    link.setAttribute('as', type);
    document.head.append(link);

    return () => {
      link.remove();
    };
  }, [type, asset]);
};
