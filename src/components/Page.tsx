import * as React from 'react';
import RobotSim from './RobotSim';

export default function Page() {
  const [widthHeight, setWidthHeight] = React.useState<{
    width: number;
    height: number;
  }>();
  const elemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (elemRef.current) {
      const size = elemRef.current.getBoundingClientRect();
      setWidthHeight({width: size.width, height: size.height});
    }
  }, [setWidthHeight]);

  // TODO: detect resize?

  return (
    <div ref={elemRef} style={{width: '100%', height: '100%'}}>
      {!widthHeight ? null : (
        <RobotSim
          width={widthHeight.width}
          height={widthHeight.height}
          cars={[
            {powerCoef: 1, color: '#ff0000'},
            {powerCoef: 0.5, color: '#00ff00'},
            {powerCoef: 0.2, color: '#0000ff'}
          ]}
        />
      )}
    </div>
  );
}
