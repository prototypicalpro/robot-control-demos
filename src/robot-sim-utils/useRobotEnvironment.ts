import * as React from 'react';
import {
  Engine,
  Render,
  Runner,
  MouseConstraint,
  Mouse,
  World,
  Bodies,
  Events,
  Body,
  Vector
} from 'matter-js';
import MotorModel from './MotorModel';
import makeCarComposite from './makeCarComposite';

function useRobotEnvironment(canvas?: HTMLCanvasElement | null) {
  const leftKeyPressed = React.useRef(false);
  const rightKeyPressed = React.useRef(false);

  React.useEffect(() => {
    if (!canvas) return;
    // bind keypress events
    const keyUpHandle = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.code === 'ArrowLeft') leftKeyPressed.current = true;
      else if (e.code === 'ArrowRight') rightKeyPressed.current = true;
    };
    const keyDownHandle = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.code === 'ArrowLeft') leftKeyPressed.current = false;
      else if (e.code === 'ArrowRight') rightKeyPressed.current = false;
    };
    document.addEventListener('keydown', keyUpHandle, {passive: true});
    document.addEventListener('keyup', keyDownHandle, {passive: true});
    // create engine
    const engine = Engine.create();
    const world = engine.world;

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    World.add(world, [
      // walls
      Bodies.rectangle(400, 0, 800, 50, {isStatic: true}),
      Bodies.rectangle(400, 600, 800, 50, {isStatic: true}),
      Bodies.rectangle(800, 300, 50, 600, {isStatic: true}),
      Bodies.rectangle(0, 300, 50, 600, {isStatic: true})
    ]);

    const scale = 0.9;
    const {composite: car, frontWheel, backWheel} = makeCarComposite(
      150,
      300,
      150 * scale,
      150 * scale,
      40 * scale,
      0.8,
      0.00006
    );
    // car 1
    World.add(world, car);

    const render = Render.create({
      canvas,
      engine: engine,
      options: {
        showAngleIndicator: true,
        showCollisions: true
      } as any
    });

    Render.run(render);

    // add mouse control
    const mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        } as any
      });

    World.add(world, mouseConstraint);

    // create motor models
    const motorOpts = {
      maxTorque: 0.01,
      frictionCoef: 1,
      stuckPowerThresh: 0.05,
      stuckAngularVelocityThresh: 0.5
    };
    const frontMotor = new MotorModel(motorOpts);
    const backMotor = new MotorModel(motorOpts);

    // add keyboard control
    let lastTimestamp = 0;
    Events.on(engine, 'beforeUpdate', function (event) {
      // adjust the power of the motor on keyboard down
      const power = leftKeyPressed.current
        ? 1
        : rightKeyPressed.current
        ? -1
        : 0;
      frontMotor.setPower(power);
      backMotor.setPower(power);
      // step the motors
      const delta = event.timestamp - lastTimestamp;
      const {force: frontForce} = frontMotor.step(
        delta,
        frontWheel.angularVelocity
      );
      const {force: backForce} = backMotor.step(
        delta,
        backWheel.angularVelocity
      );
      // console.log(frontForce.x, backForce.x);
      // apply reverse forces to the top and bottom edge of the wheel to rotate it
      Body.applyForce(
        frontWheel,
        Vector.add(
          frontWheel.position,
          Vector.create(0, frontWheel.circleRadius)
        ),
        frontForce
      );
      Body.applyForce(
        frontWheel,
        Vector.add(
          frontWheel.position,
          Vector.create(0, -(frontWheel.circleRadius as number))
        ),
        Vector.create(-frontForce.x, frontForce.y)
      );
      Body.applyForce(
        backWheel,
        Vector.add(
          backWheel.position,
          Vector.create(0, backWheel.circleRadius)
        ),
        backForce
      );
      Body.applyForce(
        backWheel,
        Vector.add(
          frontWheel.position,
          Vector.create(0, -(backWheel.circleRadius as number))
        ),
        Vector.create(-backForce.x, backForce.y)
      );
    });

    // keep the mouse in sync with rendering
    (render as any).mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
      min: {x: 0, y: 0},
      max: {x: 800, y: 600}
    });

    return () => {
      console.log('ended');
      document.removeEventListener('keyup', keyUpHandle);
      document.removeEventListener('keydown', keyDownHandle);
      Render.stop(render);
      Runner.stop(runner);
    };
  }, [canvas]);
}

export default useRobotEnvironment;
