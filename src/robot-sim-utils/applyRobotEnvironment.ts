import {
  World,
  Bodies,
  Body,
  Composite,
  Composites,
  Constraint
} from 'matter-js';
import OBJECT_ID from './objectId';

const NO_DENSITY = 1e-30;

/**
 * Creates a composite with simple car setup of bodies and constraints.
 *
 * @param {number} xx
 * @param {number} yy
 * @param {number} width
 * @param {number} height
 * @param {number} wheelSize
 * @returns {composite} A new composite car body
 */
function makeCarComposite(
  xx: number,
  yy: number,
  width: number,
  height: number,
  wheelSize: number,
  wheelFriction: number,
  color?: {
    flag?: string;
    body?: string;
    wheels?: string;
    flagPole?: string;
  }
) {
  const group = Body.nextGroup(true),
    wheelBase = 20,
    wheelAOffset = -width * 0.5 + wheelBase,
    wheelBOffset = width * 0.5 - wheelBase,
    wheelYOffset = width * 0.5 - wheelBase,
    flagXOffset = width * -0.5,
    flagYOffset = height * -0.5;

  const car = Composite.create({label: 'Car'});
  const body = Bodies.rectangle(xx, yy, width, height, {
    collisionFilter: {
      group: group
    },
    density: 0.0001,
    id: OBJECT_ID.CAR_BODY,
    render: {
      fillStyle: color?.body
    }
  });

  Body.rotate(body, Math.PI);

  const wheelA = Bodies.circle(
    xx + wheelAOffset,
    yy + wheelYOffset,
    wheelSize,
    {
      collisionFilter: {
        group: group
      },
      friction: wheelFriction,
      id: OBJECT_ID.CAR_WHEEL_BACK,
      render: {
        fillStyle: color?.wheels
      }
    }
  );

  const wheelB = Bodies.circle(
    xx + wheelBOffset,
    yy + wheelYOffset,
    wheelSize,
    {
      collisionFilter: {
        group: group
      },
      friction: wheelFriction,
      id: OBJECT_ID.CAR_WHEEL_FRONT,
      render: {
        fillStyle: color?.wheels
      }
    }
  );

  const axelA = Constraint.create({
    bodyB: body,
    pointB: {x: wheelAOffset, y: wheelYOffset},
    bodyA: wheelA,
    stiffness: 1,
    length: 0
  });

  const axelB = Constraint.create({
    bodyB: body,
    pointB: {x: wheelBOffset, y: wheelYOffset},
    bodyA: wheelB,
    stiffness: 1,
    length: 0
  });

  const particleRadius = 10;
  const rowCount = 5;
  const flagGroup = Body.nextGroup(false);
  const flagPole = Composites.softBody(
    xx + flagXOffset - particleRadius,
    yy + flagYOffset - particleRadius * (2 * rowCount - 1),
    2,
    rowCount,
    0,
    0,
    true,
    particleRadius,
    {
      render: {
        visible: true,
        fillStyle: color?.flagPole
      },
      density: 0.001,
      slop: 0.005,
      collisionFilter: {group: flagGroup, category: 0}
    },
    {
      stiffness: 0.5
    }
  );

  const leftFlagMountPoint = flagPole.bodies[flagPole.bodies.length - 2];
  const rightFlagMountPoint = flagPole.bodies[flagPole.bodies.length - 1];

  const flagBodyLeft = Constraint.create({
    bodyB: body,
    pointB: {x: flagXOffset, y: flagYOffset},
    bodyA: leftFlagMountPoint,
    stiffness: 1,
    length: 0
  });

  const flagBodyRight = Constraint.create({
    bodyB: body,
    pointB: {x: flagXOffset + 2 * particleRadius, y: flagYOffset},
    bodyA: rightFlagMountPoint,
    stiffness: 1,
    length: 0
  });

  const flagRadius = (4 * particleRadius) / Math.sqrt(3);
  const flagTriangle = Bodies.polygon(
    xx + flagXOffset - 2 * particleRadius - 2,
    yy + flagYOffset - particleRadius * (rowCount + 1),
    3,
    flagRadius,
    {
      density: NO_DENSITY,
      collisionFilter: {group: flagGroup},
      render: {
        fillStyle: color?.flag
      }
    }
  );

  const flagMount = Constraint.create({
    bodyB: flagPole.bodies[2],
    pointB: {x: 0, y: 0},
    bodyA: flagTriangle,
    pointA: {x: flagRadius / 2, y: 0},
    stiffness: 0.9
  });

  Composite.add(car, body);
  Composite.add(car, wheelA);
  Composite.add(car, wheelB);
  Composite.add(car, axelA);
  Composite.add(car, axelB);
  //Composite.add(car, flagPole);
  //Composite.add(car, flagBodyLeft);
  //Composite.add(car, flagBodyRight);
  //Composite.add(car, flagTriangle);
  //Composite.add(car, flagMount);

  return car;
}

export default function applyRobotEnvironment(
  world: World,
  width: number,
  height: number,
  color?: {
    flag?: string;
    body?: string;
    wheels?: string;
    flagPole?: string;
    pointB?: string;
    walls?: string;
  }
) {
  World.clear(world, false);
  // walls
  World.add(world, [
    // walls
    Bodies.rectangle(width / 2, 0, width, 50, {
      isStatic: true,
      render: {fillStyle: color?.walls}
    }),
    Bodies.rectangle(width / 2, height, width, 50, {
      isStatic: true,
      render: {fillStyle: color?.walls}
    }),
    Bodies.rectangle(width, height / 2, 50, height, {
      isStatic: true,
      render: {fillStyle: color?.walls}
    }),
    Bodies.rectangle(0, height / 2, 50, height, {
      isStatic: true,
      render: {fillStyle: color?.walls}
    })
  ]);
  // create the car
  const scale = 0.8;
  const car = makeCarComposite(
    150,
    height - 150,
    150 * scale,
    150 * scale,
    40 * scale,
    0.8,
    color
  );
  // car 1
  World.add(world, car);
  // create the destination point
  World.add(
    world,
    Bodies.rectangle(width * 0.8, height / 2, 1, height, {
      isSensor: true,
      isStatic: true,
      id: OBJECT_ID.SENSOR_B,
      render: {
        strokeStyle: color?.pointB,
        fillStyle: 'transparent',
        lineWidth: 1
      }
    })
  );
}
