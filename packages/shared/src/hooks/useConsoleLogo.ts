import { useEffect } from 'react';

export function useConsoleLogo(): void {
  useEffect(() => {
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
