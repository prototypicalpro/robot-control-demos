import * as React from 'react';
import useRobotEnvironment from '../robot-sim-utils/useRobotEnvironment';

const RobotSim: React.FunctionComponent<{
  style?: React.CSSProperties;
  className?: string;
}> = ({style, className}) => {
  const [canvas, setCanvas] = React.useState<HTMLCanvasElement>();

  useRobotEnvironment(canvas);

  return (
    <canvas
      style={style}
      className={className}
      ref={canvas => canvas && setCanvas(canvas)}
      width={800}
      height={800}
    />
  );
};

export default RobotSim;
