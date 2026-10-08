import { useEffect, useState } from 'react';

// Pickers that open a menu or a file dialog change nothing the form can see
// until later, so pressing one counts as touching the form.
const pickerSelector =
  'button:not([type="submit"]), [role="button"], [role="radio"], [role="switch"]';

// An uncontrolled form keeps no dirty state, so a Save that waits for a
// change waits for the first edit inside the form instead. Listening on the
// document covers a form that mounts after its Save and fields that join it
// through the form attribute.
export const useFormTouched = (formId: string, enabled = true): boolean => {
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (!enabled || isTouched) {
      return undefined;
    }

    const isInForm = (target: EventTarget | null): target is Element =>
      target instanceof Element &&
      ((target as HTMLInputElement).form?.id === formId ||
        !!target.closest(`[id="${formId}"]`));
    const onEdit = (event: Event) => {
      if (isInForm(event.target)) {
        setIsTouched(true);
      }
    };
    const onPress = (event: Event) => {
      if (isInForm(event.target) && event.target.closest(pickerSelector)) {
        setIsTouched(true);
      }
    };

    document.addEventListener('input', onEdit, true);
    document.addEventListener('change', onEdit, true);
    document.addEventListener('click', onPress, true);

    return () => {
      document.removeEventListener('input', onEdit, true);
      document.removeEventListener('change', onEdit, true);
      document.removeEventListener('click', onPress, true);
    };
  }, [enabled, formId, isTouched]);

  return isTouched;
};
