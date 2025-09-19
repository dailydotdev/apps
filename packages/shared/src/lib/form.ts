export function formToJson<T>(form: HTMLFormElement, initialValue?: T): T {
  return Array.from(form.elements).reduce((acc, val: HTMLInputElement) => {
    if (val.name === '') {
      return acc;
    }

    // Handle fields that end with [] as arrays.
    if (val.name.endsWith('[]')) {
      const fieldName = val.name.slice(0, -2); // Remove []
      const existingArray = acc[fieldName] || [];

      if (val.value && val.value.trim().length > 0) {
        return { ...acc, [fieldName]: [...existingArray, val.value] };
      }

      return acc;
    }

    if (val.type === 'checkbox') {
      return { ...acc, [val.name]: val.checked };
    }
    if (val.type === 'radio' && !val.checked) {
      return acc;
    }
    if (val.type === 'file') {
      return { ...acc, [val.name]: val.files.length === 0 ? null : val.files };
    }
    return {
      ...acc,
      [val.name]: val.value.length ? val.value : null,
    };
  }, initialValue);
}
