import { useEffect } from 'react';
import { isProduction } from '../lib/constants';

export function useConsoleLogo(): void {
  useEffect(() => {
    if (!isProduction) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`







               ....            ....
             ........        .......
           ............    ......  ....
         ......    ....  ......    ......
       ......          ......        ......
       ......        ......          ......
         ......    ......          .....
           ............          .....
             ........          .....
               ....             ..






                                                  `);
  }, []);
}
