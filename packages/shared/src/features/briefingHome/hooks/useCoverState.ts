import { useCallback, useEffect, useState } from 'react';

const COLLAPSE_KEY = 'briefing-home-collapsed';
const HIDE_KEY = 'briefing-home-hidden-until';

const todayKey = (): string => new Date().toISOString().slice(0, 10);

const loadCollapsed = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(COLLAPSE_KEY) === '1';
};

const loadHiddenForToday = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(HIDE_KEY) === todayKey();
};

type CoverState = {
  isHydrated: boolean;
  isCollapsed: boolean;
  isHidden: boolean;
  collapse: () => void;
  expand: () => void;
  hideForToday: () => void;
  reshow: () => void;
};

export const useCoverState = (): CoverState => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsCollapsed(loadCollapsed());
    setIsHidden(loadHiddenForToday());
    setIsHydrated(true);
  }, []);

  const collapse = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COLLAPSE_KEY, '1');
    }
    setIsCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(COLLAPSE_KEY);
    }
    setIsCollapsed(false);
  }, []);

  const hideForToday = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HIDE_KEY, todayKey());
    }
    setIsHidden(true);
  }, []);

  const reshow = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(HIDE_KEY);
    }
    setIsHidden(false);
  }, []);

  return {
    isHydrated,
    isCollapsed,
    isHidden,
    collapse,
    expand,
    hideForToday,
    reshow,
  };
};
