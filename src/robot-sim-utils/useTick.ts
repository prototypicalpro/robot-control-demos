import * as React from 'react';

import useDataWindow from './useDataWindow';

export default function useTick(count: number, active?: boolean) {
  const animationRef = React.useRef<number | null>(null);
  const [{data: ticks}, addToTicks] = useDataWindow<DOMHighResTimeStamp>(count);
  // use requestAnimationFrame to tick
  React.useEffect(() => {
    if (active) {
      const animationCallback = (data: DOMHighResTimeStamp) => {
        addToTicks({action: 'add', data});
        animationRef.current = requestAnimationFrame(animationCallback);
      };
      animationRef.current = requestAnimationFrame(animationCallback);
      // cleanup
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        addToTicks({action: 'clear'});
      };
    }
  }, [active, addToTicks]);
  // return the current tick and delta
  return ticks;
}
