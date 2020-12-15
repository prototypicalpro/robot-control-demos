import {
  Engine,
  Runner,
  Render,
  Mouse,
  MouseConstraint,
  World,
  Events,
  Body
} from 'matter-js';
import * as React from 'react';
import applyRobotEnvironment from '../robot-sim-utils/applyRobotEnvironment';
import OBJECT_ID from '../robot-sim-utils/objectId';
import useTick from '../robot-sim-utils/useTick';

function idsInPair(body1: Body, body2: Body, id1: number, id2: number) {
  return (
    (body1.id === id1 && body2.id === id2) ||
    (body1.id === id2 && body2.id === id1)
  );
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

  // setup engine and world
  React.useEffect(() => {
    if (canvasRef.current) {
      // reset the engine
      Engine.clear(engineRef.current);
      // reset the world
      World.clear(engineRef.current.world, false);
      // generate the environment
      applyRobotEnvironment(engineRef.current.world, width, height, {
        body: '#000000a0',
        wheels: '#000000a0',
        flag: '#ff4500a0',
        flagPole: '#000000a0'
      });
      // generate a renderer
      rendererRef.current = Render.create({
        canvas: canvasRef.current,
        engine: engineRef.current,
        options: {
          width,
          height,
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
      Events.on(
        engineRef.current,
        'collisionStart',
        ({pairs}: {pairs: {bodyA: Body; bodyB: Body}[]}) => {
          const pointBCollide = pairs.find(({bodyA, bodyB}) =>
            idsInPair(bodyA, bodyB, OBJECT_ID.SENSOR_B, OBJECT_ID.CAR_BODY)
          );
          if (pointBCollide) {
            const body =
              pointBCollide.bodyA.id === OBJECT_ID.SENSOR_B
                ? pointBCollide.bodyA
                : pointBCollide.bodyB;
            body.render.strokeStyle = 'green';
          }
        }
      );
      Events.on(
        engineRef.current,
        'collisionEnd',
        ({pairs}: {pairs: {bodyA: Body; bodyB: Body}[]}) => {
          const pointBCollide = pairs.find(({bodyA, bodyB}) =>
            idsInPair(bodyA, bodyB, OBJECT_ID.SENSOR_B, OBJECT_ID.CAR_BODY)
          );
          if (pointBCollide) {
            const body =
              pointBCollide.bodyA.id === OBJECT_ID.SENSOR_B
                ? pointBCollide.bodyA
                : pointBCollide.bodyB;
            body.render.strokeStyle = 'red';
          }
        }
      );
      // fit the render viewport to the scene
      Render.lookAt(rendererRef.current, {
        min: {x: 0, y: 0},
        max: {x: width, y: height}
      });
    }
  }, [canvasRef, engineRef, rendererRef, width, height]);

  // get the current tick
  const {curTick, lastTick} = useTick(simulationActive);

  // step the simulation
  React.useEffect(() => {
    if (simulationActive && curTick && lastTick && rendererRef.current) {
      Engine.update(engineRef.current, curTick - lastTick);
      Render.world(rendererRef.current);
    }
  }, [simulationActive, curTick, lastTick]);

  return (
    <canvas
      style={style}
      className={className}
      ref={canvasRef}
      width={width}
      height={height}
    />
  );
};

export default RobotSim;
