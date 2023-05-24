export function formToJson<T>(form: HTMLFormElement, initialValue?: T): T {
  return Array.from(form.elements).reduce((acc, val: HTMLInputElement) => {
    if (val.name === '') {
      return acc;
    }
    if (val.type === 'checkbox') {
      return { ...acc, [val.name]: val.checked };
    }
    if (val.type === 'radio' && !val.checked) {
      return acc;
    }
    if (val.type === 'file') {
      if (val.files.length === 0) return { ...acc, [val.name]: null };

      const value = val.files.length === 1 ? val.files[0] : val.files;
      return { ...acc, [val.name]: value };
    }
    return {
      ...acc,
      [val.name]: val.value.length ? val.value : null,
    };
  }, initialValue);
}
