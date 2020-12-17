import * as React from 'react';

export default function useTick(active?: boolean) {
  const animationRef = React.useRef<number | null>(null);
  const [tick, setTick] = React.useState(0);

  // use requestAnimationFrame to tick
  React.useEffect(() => {
    if (active) {
      const animationCallback = (data: DOMHighResTimeStamp) => {
        setTick(data);
        animationRef.current = requestAnimationFrame(animationCallback);
      };
      animationRef.current = requestAnimationFrame(animationCallback);
      // cleanup
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        setTick(0);
      };
    }
  }, [active]);
  // return the current tick and delta
  return tick;
}
