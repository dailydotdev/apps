import { browser } from 'webextension-polyfill-ts';

browser.runtime.onMessage.addListener(async (request, sender) => {
  console.log('req: ', request);
});

const init = async () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.style.background = 'red';
  div.style.color = 'white';
  div.style.position = 'fixed';
  div.style.right = '0';
  div.style.top = '0';
  div.style.padding = '1rem';
  div.innerHTML = `Daily.dev is here 👀 <br />See you are browsing: ${window.location.href}`;
};

init();
