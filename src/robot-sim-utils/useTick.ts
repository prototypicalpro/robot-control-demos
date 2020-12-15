import * as React from 'react';

export default function useTick(active?: boolean) {
  const animationRef = React.useRef<number | null>(null);
  const [tick, setTick] = React.useState<{curTick?: number; lastTick?: number}>(
    {}
  );
  // use requestAnimationFrame to tick
  React.useEffect(() => {
    if (active) {
      const animationCallback = (t: DOMHighResTimeStamp) => {
        setTick(({curTick}) => ({lastTick: curTick, curTick: t}));
        animationRef.current = requestAnimationFrame(animationCallback);
      };
      animationRef.current = requestAnimationFrame(animationCallback);
      // cleanup
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        setTick({});
      };
    }
  }, [active]);
  // return the current tick and delta
  return tick;
}
