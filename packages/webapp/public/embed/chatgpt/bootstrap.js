if (window.parent !== window) {
  const { history, location } = window;

  history.replaceState(
    history.state,
    '',
    `${location.origin}/embed/chatgpt/post`,
  );
  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method].bind(history);
    history[method] = (state, title, url) => {
      if (url === undefined || url === null) {
        return original(state, title, url);
      }

      const target = new URL(url, document.baseURI);
      return original(
        state,
        title,
        `${location.origin}${target.pathname}${target.search}${target.hash}`,
      );
    };
  });
}
