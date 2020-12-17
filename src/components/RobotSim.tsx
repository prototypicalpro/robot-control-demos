import * as React from 'react';
import {
  Engine,
  Render,
  Mouse,
  MouseConstraint,
  World,
  Events,
  Body,
  Composite,
  Runner,
  Vector
} from 'matter-js';
import '../../node_modules/react-vis/dist/style.css';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeriesCanvas
} from 'react-vis';
import applyRobotEnvironment from '../robot-sim-utils/applyRobotEnvironment';
import OBJECT_ID from '../robot-sim-utils/objectId';
import DataWindow from '../robot-sim-utils/DataWindow';
import useKeyboard from '../robot-sim-utils/useKeyboard';

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
  const [curTick, setCurTick] = React.useState(0);
  const [processedTick, setProcessedTick] = React.useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const engineRef = React.useRef(Engine.create());
  const rendererRef = React.useRef<Render>();
  const runnerRef = React.useRef<Runner>();
  const bodyRef = React.useRef<Body>();
  const wheelARef = React.useRef<Body>();
  const wheelBRef = React.useRef<Body>();
  const pointBRef = React.useRef<Body>();
  const tickWindowRef = React.useRef<DataWindow<DOMHighResTimeStamp>>(
    new DataWindow(100)
  );
  const positionWindowRef = React.useRef<DataWindow<number>>(
    new DataWindow(100)
  );
  const velocityWindowRef = React.useRef<DataWindow<number>>(
    new DataWindow(100)
  );
  const accelerationWindowRef = React.useRef<DataWindow<number>>(
    new DataWindow(100)
  );

  // setup engine and world
  React.useEffect(() => {
    if (canvasRef.current) {
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
      wheelARef.current = Composite.get(
        engineRef.current.world,
        OBJECT_ID.CAR_WHEEL_FRONT,
        'body'
      ) as Body;
      wheelBRef.current = Composite.get(
        engineRef.current.world,
        OBJECT_ID.CAR_WHEEL_BACK,
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
      Events.on(engineRef.current, 'afterUpdate', ({timestamp}) =>
        setCurTick(timestamp)
      );
      // fit the render viewport to the scene
      Render.lookAt(rendererRef.current, {
        min: {x: 0, y: 0},
        max: {x: width, y: height / 2}
      });
      // start the physics runner
      // we let it run independently because react is too slow to keep up
      runnerRef.current = Runner.create();
      Runner.start(runnerRef.current, engineRef.current);
      // cleanup
      return () => {
        // stop the runner
        if (runnerRef.current) {
          Runner.stop(runnerRef.current);
          runnerRef.current = undefined;
        }
        // reset the engine
        engineRef.current = Engine.create();
        // reset all data windows
        for (const {current} of [
          tickWindowRef,
          positionWindowRef,
          velocityWindowRef,
          accelerationWindowRef
        ])
          current.reset();
      };
    }
  }, [canvasRef, engineRef, rendererRef, width, height]);

  const keys = useKeyboard();

  React.useEffect(() => {
    if (
      rendererRef.current &&
      pointBRef.current &&
      bodyRef.current &&
      processedTick < curTick
    ) {
      // render the world
      Render.world(rendererRef.current);
      // power the motors
      if (keys.includes('ArrowRight')) {
        const frontWheel = wheelARef.current as Body;
        const backWheel = wheelBRef.current as Body;
        Body.applyForce(
          frontWheel,
          Vector.add(
            frontWheel.position,
            Vector.create(0, frontWheel.circleRadius)
          ),
          {x: -0.0025, y: 0}
        );
        Body.applyForce(
          frontWheel,
          Vector.add(
            frontWheel.position,
            Vector.create(0, -(frontWheel.circleRadius as number))
          ),
          {x: 0.0025, y: 0}
        );
        Body.applyForce(
          backWheel,
          Vector.add(
            backWheel.position,
            Vector.create(0, backWheel.circleRadius)
          ),
          {x: -0.0025, y: 0}
        );
        Body.applyForce(
          backWheel,
          Vector.add(
            frontWheel.position,
            Vector.create(0, -(backWheel.circleRadius as number))
          ),
          {x: 0.0025, y: 0}
        );
      } else if (keys.includes('ArrowLeft')) {
        const frontWheel = wheelARef.current as Body;
        const backWheel = wheelBRef.current as Body;
        Body.applyForce(
          frontWheel,
          Vector.add(
            frontWheel.position,
            Vector.create(0, frontWheel.circleRadius)
          ),
          {x: 0.005, y: 0}
        );
        Body.applyForce(
          frontWheel,
          Vector.add(
            frontWheel.position,
            Vector.create(0, -(frontWheel.circleRadius as number))
          ),
          {x: -0.005, y: 0}
        );
        Body.applyForce(
          backWheel,
          Vector.add(
            backWheel.position,
            Vector.create(0, backWheel.circleRadius)
          ),
          {x: 0.005, y: 0}
        );
        Body.applyForce(
          backWheel,
          Vector.add(
            frontWheel.position,
            Vector.create(0, -(backWheel.circleRadius as number))
          ),
          {x: -0.005, y: 0}
        );
      }
      if (processedTick + 50 < curTick) {
        // calculate vectors
        const delta = curTick - (tickWindowRef.current.recent() || 0);
        const dist = pointBRef.current.position.x - bodyRef.current.position.x;
        const velocity =
          ((positionWindowRef.current.recent() || 0) - dist) / delta;
        const acceleration =
          (velocity - (velocityWindowRef.current.recent() || 0)) / delta;
        // update tick state
        tickWindowRef.current.addData(curTick);
        // update other state
        positionWindowRef.current.addData(dist);
        velocityWindowRef.current.addData(velocity);
        accelerationWindowRef.current.addData(acceleration);
        // indicate we have processed the next tick
        setProcessedTick(curTick);
      }
    }
  }, [processedTick, curTick, keys]);

  // generate data by zipping the tickWindow with all the other properties
  const {position, velocity, acceleration, timeDomain} = React.useMemo(() => {
    const tickVal = tickWindowRef.current.values();
    return {
      timeDomain: [
        tickWindowRef.current.get(0),
        tickWindowRef.current.recent()
      ],
      position: tickVal.map((x, i) => ({
        x,
        y: positionWindowRef.current.get(i)
      })),
      velocity: tickVal.map((x, i) => ({
        x,
        y: velocityWindowRef.current.get(i)
      })),
      acceleration: tickVal.map((x, i) => ({
        x,
        y: accelerationWindowRef.current.get(i)
      }))
    };
  }, [processedTick]);

  // const velocity = ticksWindow.map((t, i) => ({x: t, y: velocityWindow[i]}));
  // const acceleration = ticksWindow.map((t, i) => ({
  //  x: t,
  //  y: accelerationWindow[i]
  // }));

  return (
    <>
      <canvas
        style={style}
        className={className}
        ref={canvasRef}
        width={width}
        height={height / 2}
      />
      <div style={{display: 'flex'}}>
        <XYPlot
          xDomain={timeDomain}
          yDomain={[-200, 750]}
          width={300}
          height={300}
        >
          <HorizontalGridLines />
          <LineSeriesCanvas data={position} />
          <XAxis title="Time (s)" />
          <YAxis title="Disance (px)" />
        </XYPlot>
        <XYPlot xDomain={timeDomain} yDomain={[-1, 1]} width={300} height={300}>
          <HorizontalGridLines />
          <LineSeriesCanvas data={velocity} />
          <XAxis title="Time (s)" />
          <YAxis title="Velocity (px/s)" />
        </XYPlot>
        <XYPlot
          xDomain={timeDomain}
          yDomain={[-0.001, 0.001]}
          width={300}
          height={300}
        >
          <HorizontalGridLines />
          <LineSeriesCanvas data={acceleration} />
          <XAxis title="Time (s)" />
          <YAxis title="Acceleration (px/s^2)" />
        </XYPlot>
      </div>
    </>
  );
};

export default RobotSim;
