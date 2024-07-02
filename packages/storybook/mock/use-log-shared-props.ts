import { useRef, useState } from 'react';

/*
* Had to mock this hook because it uses `useRouter` inside
* */

export default function useLogSharedProps() {
  const ref = useRef();
  const [sharedPropsSet, setSharedPropsSet] = useState(false);

  return [ref, setSharedPropsSet];
}
