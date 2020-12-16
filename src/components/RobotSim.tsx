import * as React from 'react';
import {
  Engine,
  Render,
  Mouse,
  MouseConstraint,
  World,
  Events,
  Body,
  Composite
} from 'matter-js';
import '../../node_modules/react-vis/dist/style.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import applyRobotEnvironment from '../robot-sim-utils/applyRobotEnvironment';
import OBJECT_ID from '../robot-sim-utils/objectId';
import useTick from '../robot-sim-utils/useTick';
import useDataWindow from '../robot-sim-utils/useDataWindow';

function idsInPair(body1: Body, body2: Body, id1: number, id2: number) {
  return (
    (body1.id === id1 && body2.id === id2) ||
    (body1.id === id2 && body2.id === id1)
  );
}

function handlePointBEvent(
  eventType: string,
  {pairs}: {pairs: {bodyA: Body; bodyB: Body}[]}
) {
  const pointBCollide = pairs.find(({bodyA, bodyB}) =>
    idsInPair(bodyA, bodyB, OBJECT_ID.SENSOR_B, OBJECT_ID.CAR_BODY)
  );
  if (pointBCollide) {
    const body =
      pointBCollide.bodyA.id === OBJECT_ID.SENSOR_B
        ? pointBCollide.bodyA
        : pointBCollide.bodyB;
    body.render.strokeStyle = eventType === 'collisionStart' ? 'green' : 'red';
  }
}

const RobotSim: React.FunctionComponent<{
  width: number;
  height: number;
  style?: React.CSSProperties;
  className?: string;
}> = ({style, className, width, height}) => {
  const [simulationActive, setSimulationActive] = React.useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const engineRef = React.useRef(Engine.create());
  const rendererRef = React.useRef<Render>();
  const bodyRef = React.useRef<Body>();
  const pointBRef = React.useRef<Body>();

  // setup engine and world
  React.useEffect(() => {
    if (canvasRef.current) {
      // reset the engine
      Engine.clear(engineRef.current);
      // reset the world
      World.clear(engineRef.current.world, false);
      // generate the environment
      applyRobotEnvironment(engineRef.current.world, width, height / 2, {
        body: '#000000a0',
        wheels: '#000000a0',
        flag: '#ff4500a0',
        flagPole: '#000000a0'
      });
      bodyRef.current = Composite.get(
        engineRef.current.world,
        OBJECT_ID.CAR_BODY,
        'body'
      ) as Body;
      pointBRef.current = Composite.get(
        engineRef.current.world,
        OBJECT_ID.SENSOR_B,
        'body'
      ) as Body;
      // generate a renderer
      rendererRef.current = Render.create({
        canvas: canvasRef.current,
        engine: engineRef.current,
        options: {
          width,
          height: height / 2,
          wireframes: false,
          showAngleIndicator: true,
          background: '#00000000'
          // showCollisions: true
        } as any
      });
      // add mouse control for debugging
      const mouse = Mouse.create(rendererRef.current.canvas);
      const mouseConstraint = MouseConstraint.create(engineRef.current, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        } as any
      });
      World.add(engineRef.current.world, mouseConstraint);
      // keep the mouse in sync with rendering
      (rendererRef.current as any).mouse = mouse;
      // add animations for point B
      Events.on(engineRef.current, 'collisionStart', event =>
        handlePointBEvent('collisionStart', event)
      );
      Events.on(engineRef.current, 'collisionEnd', event =>
        handlePointBEvent('collisionEnd', event)
      );
      // fit the render viewport to the scene
      Render.lookAt(rendererRef.current, {
        min: {x: 0, y: 0},
        max: {x: width, y: height / 2}
      });
    }
  }, [canvasRef, engineRef, rendererRef, width, height]);

  // get the current tick
  const [lastTick2, lastTick, curTick] = useTick(3, simulationActive);
  // get a data window for the distance from point B
  const [{data: distWindow}, setDistWindow] = useDataWindow<{
    x: number;
    y: number;
  }>(100);

  // step the simulation adn re-render the graphs
  React.useEffect(() => {
    if (
      simulationActive &&
      curTick &&
      lastTick &&
      lastTick2 &&
      rendererRef.current &&
      bodyRef.current &&
      pointBRef.current
    ) {
      // step simulation
      const delta = curTick - lastTick;
      Engine.update(engineRef.current, delta, delta / (lastTick - lastTick2));
      Render.world(rendererRef.current);
      // update the graphs
      setDistWindow({
        action: 'add',
        data: {
          x: curTick,
          y: bodyRef.current.position.x - pointBRef.current.position.x
        }
      });
    }
  }, [simulationActive, curTick, lastTick, lastTick2, setDistWindow]);

  return (
    <>
      <canvas
        style={style}
        className={className}
        ref={canvasRef}
        width={width}
        height={height / 2}
      />
      <XYPlot width={300} height={300}>
        <HorizontalGridLines />
        <LineSeries data={distWindow} />
        <XAxis title="Time (s)" />
        <YAxis title="Disance (px)" />
      </XYPlot>
    </>
  );
};

export default RobotSim;
