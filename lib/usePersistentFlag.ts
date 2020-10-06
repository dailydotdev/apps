import { useEffect, useState } from 'react';

export default function usePersistentFlag(
  key: string,
  initialValue: boolean,
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const setValueAndPersist = (newValue: boolean) => {
    if (newValue !== value) {
      setValue(newValue);
      localStorage.setItem(key, newValue.toString());
    }
  };

  useEffect(() => {
    const cachedValue = localStorage.getItem(key);
    if (cachedValue) {
      setValue(cachedValue === 'true');
    }
  }, []);

  return [value, setValueAndPersist];
}
