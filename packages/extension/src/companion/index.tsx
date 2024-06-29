import React from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import {
  applyTheme,
  themeModes,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { setOnError } from '@dailydotdev/shared/src/components/ProfilePicture';
import { getCompanionWrapper } from '@dailydotdev/shared/src/lib/extension';
import App, { CompanionData } from './App';

let root: ReturnType<typeof createRoot>;

const renderApp = (props: CompanionData) => {
  setOnError((e) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNBOEIzQ0YiIGQ9Ik0wIDBoMjU2djI1NkgweiIvPjxwYXRoIGQ9Ik0xMjcuOTk2IDY5YzE3LjQ4OCAwIDMxLjY2NSAxNC4wNTggMzEuNjY1IDMxLjQgMCAxMC4zNDgtNS4wOTcgMTkuODQyLTEzLjY0MiAyNS43OTZsLTEuMTY5Ljc2NyAyLjAxOC42NTUgMi4wMTMuNzI4LjcwMy4yOTggMS43MDIuODAyYzE1LjIyNCA3LjUzOCAyNS4zMDYgMjEuOTIgMjYuNTgxIDM4LjMyOWwuMTAzIDEuNzY1LjAzIDEuNzU2LS4wMDIgMi4zMjctLjAzLjc1Ny0uMDUzLjY4NC0uMDkuNzY0Yy0uOTgzIDYuMjQ2LTUuOTc3IDExLjA5LTEyLjI1MSAxMS45N2wtMS4xMi4xMTMtMS40MTMuMDg5LTEzLjIzMi0yLjkwNGMtMy4yMTQtLjcwNS01LjM4OS0zLjYxMi01LjIxNy02LjhsLjA4MS0uNzQgMS45ODItMTEuODEyLjEwNy0uNzU4Yy4zNDctMy40NDItMi4wNzUtNi41OTItNS41NDQtNy4xNjJsLS41NDQtLjA2Ny0uNTQ3LS4wMjItMjMuOTMxLS4wMDYtLjc3Mi4wMmMtMy4yMTMuMjA3LTUuNzkyIDIuNjgtNi4xNzMgNS41ODlsLS4wNDguNzM1LjAxMy42MzUuMDgxLjcyMyAyLjAyOCAxMi4xMjljLjUzOSAzLjIxOC0xLjM2OCA2LjMwMy00LjQxMyA3LjMzNWwtLjcyMi4yTDkyLjk2NSAxODhsLTEuODgxLS4xMy0uODU4LS4wOTRjLTYuMjY5LS45Ny0xMS4xNi01Ljg5Mi0xMi4wODUtMTIuNDMxbC0uMTIyLTEuMTctLjAxOS0uOTE5LjAwOC0yLjM3NS4wNDEtMS43NTRjLjc3NC0xNy41NjQgMTEuODItMzMuMTA4IDI5LjA4OC00MC43OTNhNjMuODIgNjMuODIgMCAwIDEgMy45OS0xLjM2OGwtLjExNS0uMDYyYy05LjA2NS01LjcyLTE0LjY4LTE1LjY0Mi0xNC42OC0yNi41MDQgMC0xNy4zNDIgMTQuMTc3LTMxLjQgMzEuNjY0LTMxLjRabTAgOTUuODUzYzMuNjgyIDAgNi42NjYgMi45NiA2LjY2NiA2LjYxIDAgMy42NTItMi45ODQgNi42MTEtNi42NjYgNi42MTEtMy42ODEgMC02LjY2Ni0yLjk2LTYuNjY2LTYuNjEgMC0zLjY1MSAyLjk4NS02LjYxIDYuNjY2LTYuNjFabS4wMS0zMC41NGMtNS43NjQtLjAwMi0xMS41MjkgMS4wOTItMTcuMjkzIDMuMjgxLTEyLjgxNCA1LjcxNi0yMS4zODggMTcuMjUxLTIyLjU2OCAzMC4zODNsLS4xMDYgMS41ODMtLjAzNCAxLjUzOC0uMDA2IDIuMTg0LjAxNi42NDYuMS42NzNhNC40NCA0LjQ0IDAgMCAwIDIuOTk2IDMuMjI0bC42NTcuMTUzLjQ0My4wMyA4LjczMy0xLjkxNy0xLjUxMi05LjAzNy0uMTI1LS44OTktLjA3NS0uOTAzLS4wMjUtLjkwNy4wMzYtMS4wODZjLjUxNy03LjkwMyA2LjYzNS0xNC4yOTEgMTQuNDU3LTE1LjMwMWwxLjA3Ny0uMTA0IDEuMDk2LS4wMzVoMjQuMjU0bC45MTMuMDI1YTE2LjggMTYuOCAwIDAgMSAxLjgxNC4xOThjOC4zNTQgMS4zNzQgMTQuMjE5IDguNjg3IDEzLjkzIDE2Ljg2bC0uMDcyIDEuMDctLjE0NCAxLjA3OC0xLjUxNSA5LjA0MSA4Ljc2NiAxLjkyNC42OTEtLjA5N2E0LjQzNSA0LjQzNSAwIDAgMCAzLjI4LTIuOTY3bC4xNTYtLjY1Mi4wNTMtLjY4NC4wMDItMi4zMjYtLjAyOS0xLjU3LS4wOTgtMS41OTFjLTEuMDM0LTEyLjE0NS04LjQxMS0yMi45MzgtMTkuNTc3LTI5LjA0bC0xLjQ3OC0uNzctMS41MTktLjcxNC0yLjE2Mi0uNzcxYy01LjA0NC0xLjY3OS0xMC4wODgtMi41Mi0xNS4xMzItMi41MlptLS4wMS01NS4zOTdjLTExLjk2NSAwLTIxLjY2NSA5LjYxOS0yMS42NjUgMjEuNDg0IDAgNy42MjcgNC4wMDggMTQuMzI2IDEwLjA1IDE4LjEzOWEyMS43MDMgMjEuNzAzIDAgMCAwIDExLjYxNSAzLjM0NmMzLjIwNCAwIDYuMjQ0LS42OSA4Ljk4LTEuOTI3bDEuMzQyLS42NjQgMS4yOS0uNzU5IDEuMTEtLjc0OGM1LjQyLTMuOTAyIDguOTQzLTEwLjIzNiA4Ljk0My0xNy4zODcgMC0xMS44NjUtOS43LTIxLjQ4NC0yMS42NjUtMjEuNDg0WiIgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJub256ZXJvIi8+PC9nPjwvc3ZnPg==';
  });
  applyTheme(themeModes[props.settings.theme]);

  if (!root) {
    const container = getCompanionWrapper();

    if (!container) {
      return;
    }

    root = createRoot(container);
  }

  // Set target of the React app to shadow dom
  root.render(<App {...props} />);
};

browser.runtime.onMessage.addListener((props) => {
  const { settings, postData } = props;
  if (!settings || settings?.optOutCompanion) {
    return;
  }

  const container = getCompanionWrapper();

  if (postData) {
    renderApp(props);
  } else if (container && root) {
    root.unmount();
  }
});
