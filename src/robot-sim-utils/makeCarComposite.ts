import {Body, Composite, Composites, Bodies, Constraint} from 'matter-js';

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
export default function makeCarComposite(
  xx: number,
  yy: number,
  width: number,
  height: number,
  wheelSize: number,
  wheelFriction: number,
  carDensity: number
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
    density: carDensity
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
      friction: wheelFriction
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
      friction: wheelFriction
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
      render: {visible: true},
      density: 0.001,
      collisionFilter: {group: flagGroup, category: 0}
    },
    null
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
      collisionFilter: {group: flagGroup}
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
  Composite.add(car, flagPole);
  Composite.add(car, flagBodyLeft);
  Composite.add(car, flagBodyRight);
  Composite.add(car, flagTriangle);
  Composite.add(car, flagMount);

  return {composite: car, backWheel: wheelA, frontWheel: wheelB, body};
}
