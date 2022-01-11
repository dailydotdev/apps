import { browser, Runtime } from 'webextension-polyfill-ts';
import { getBootData } from '@dailydotdev/shared/src/lib/boot';

async function forwardRequest(type, data = null) {
  const res = await browser.runtime.sendMessage({ type, data });
  console.log(res);
  return res;
}

browser.runtime.onMessage.addListener(async (request, sender) => {
  console.log(request);

  return true;
});

const init = async () => {
  //   await forwardRequest(window.location.href);

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
