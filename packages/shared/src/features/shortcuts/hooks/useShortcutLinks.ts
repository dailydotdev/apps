import type { FormEvent, MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, ShortcutsSourceType, TargetType } from '../../../lib/log';
import { useShortcutsUser } from './useShortcutsUser';
import { useShortcuts } from '../contexts/ShortcutsProvider';

export interface UseShortcutLinks {
  formRef: MutableRefObject<HTMLFormElement>;
  onSaveChanges: (
    e: FormEvent,
  ) => Promise<{ errors: Record<string | number, string> }>;
  askTopSitesBrowserPermission: () => Promise<boolean>;
  hasCheckedPermission?: boolean;
  isTopSiteActive?: boolean;
  hasTopSites?: boolean;
  isManual?: boolean;
  shortcutLinks: string[];
  formLinks: string[];
  customLinks?: string[];
  hideShortcuts: boolean;
  showGetStarted: boolean;
}

export function useShortcutLinks(): UseShortcutLinks {
  const { logEvent } = useLogContext();
  const formRef = useRef<HTMLFormElement>();

  const {
    isManual,
    sourcePreference,
    topSites,
    hasCheckedPermission,
    askTopSitesPermission,
  } = useShortcuts();

  const { customLinks, updateCustomLinks, showTopSites } = useSettingsContext();

  const hasTopSites = topSites === undefined ? null : topSites?.length > 0;
  const hasCustomLinks = customLinks?.length > 0;
  // Honour the explicit source choice from the Customize sidebar / popup
  // cards so the feed flips immediately when the user toggles between
  // "My shortcuts" and "Most visited" — without destroying their saved
  // custom links. When no preference is recorded we fall back to the
  // legacy heuristic (custom links first, top sites if none).
  const wantsTopSites = sourcePreference === 'topsites';
  const wantsManual = sourcePreference === 'manual';
  const isTopSiteActive =
    hasCheckedPermission &&
    hasTopSites &&
    (wantsTopSites || (!wantsManual && !hasCustomLinks));
  const sites = topSites?.map((site) => site.url);
  // When the user explicitly picked "Most visited" we must NOT silently
  // render their saved custom links — that's why toggling the segmented
  // control in the sidebar appeared to do nothing. Show top sites (or an
  // empty list while permission/data is loading) so the feed reflects the
  // user's intent immediately. The permission re-prompt in ShortcutsSection
  // makes sure they can grant access if they previously denied it.
  let shortcutLinks: string[] | undefined;
  if (isTopSiteActive) {
    shortcutLinks = sites;
  } else if (wantsTopSites) {
    shortcutLinks = sites ?? [];
  } else {
    shortcutLinks = customLinks;
  }
  const formLinks = (isManual ? customLinks : sites) || [];

  const { isOldUser, showToggleShortcuts, hasCompletedFirstSession } =
    useShortcutsUser();
  const hasNoShortcuts = !shortcutLinks?.length && showTopSites;
  const showGetStarted =
    !isOldUser && hasNoShortcuts && !hasCompletedFirstSession;

  const getFormInputs = () =>
    Array.from(formRef.current.elements).filter(
      (el) => el.getAttribute('name') === 'shortcutLink',
    ) as HTMLInputElement[];

  const onSaveChanges = async (e: FormEvent) => {
    e.preventDefault();

    if (!isManual) {
      updateCustomLinks([]);
      return { errors: null };
    }

    if (!formRef.current) {
      return { errors: { message: 'Form not available' } };
    }

    const isValid = formRef.current.checkValidity();

    if (!isValid) {
      return { errors: { message: 'Some of the links are not valid!' } };
    }

    const links = getFormInputs()
      .map((el) => el.value.trim())
      .filter((link) => !!link);

    updateCustomLinks(links);

    logEvent({
      event_name: LogEvent.SaveShortcutAccess,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });

    return { errors: null };
  };

  useEffect(() => {
    if (!formRef?.current) {
      return;
    }

    const elements = getFormInputs();

    elements.forEach((input: HTMLInputElement, i) => {
      // eslint-disable-next-line no-param-reassign
      input.value = formLinks?.[i]?.trim() || '';
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManual, hasCustomLinks]);

  return {
    formRef,
    isManual,
    formLinks,
    shortcutLinks,
    hasTopSites,
    isTopSiteActive,
    hasCheckedPermission,
    customLinks,
    showGetStarted,
    hideShortcuts: showToggleShortcuts,
    onSaveChanges,
    askTopSitesBrowserPermission: async () => {
      const granted = await askTopSitesPermission();

      if (granted) {
        logEvent({
          event_name: LogEvent.SaveShortcutAccess,
          target_type: TargetType.Shortcuts,
          extra: JSON.stringify({ source: ShortcutsSourceType.Browser }),
        });
      }

      return granted;
    },
  };
}
