import { useEffect } from 'react';
import { isProduction } from '../lib/constants';

export function useConsoleLogo(): void {
  useEffect(() => {
    if (!isProduction) {
      return;
    }

    globalThis.window?.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log('loaded from bfcache');
        // do something if page loaded from bfcache
      } else {
        console.log('no bfcache');
      }
    });

    // eslint-disable-next-line no-console
    console.log(`

               :*#*:                :*#*:
             :%@@@@@#.            .#@@@@@%.
            *@@@@@@@@@*.        .*@@@@@@@=+=
          *@@@@@@@@@@@@@*      *@@@@@@@=.=+++-
        =@@@@@@@=.+@@@@@@@=  =@@@@@@@+  +++++++:
      =@@@@@@@*.    *@@@%: =@@@@@@@*.    -+++++++:
    :@@@@@@@#.       .#- :@@@@@@@%.       .=++++++=.
    %@@@@@%:           .%@@@@@@%.           .=+++++=
    :@@@@@@@#.       .#@@@@@@@:            =+++++++.
      =@@@@@@@*     *@@@@@@@=            -+++++++:
        +@@@@@@@  +@@@@@@@+            :+++++++-
          *@@@@:=@@@@@@@*            :+++++++=
           .#@=@@@@@@@#.            =++++++=
             :%@@@@@%:             .+++++=.
               :*%*:                .-==.

`);
  }, []);
}
