import {Vector} from 'matter-js';

export default class MotorModel {
  private readonly maxTorque: number;
  private readonly frictionCoef: number;
  private readonly stuckPowerThresh: number;
  private readonly stuckAngularVelocityThresh: number;
  private curPower: number;

  constructor({
    maxTorque,
    frictionCoef,
    stuckPowerThresh,
    stuckAngularVelocityThresh
  }: {
    maxTorque: number;
    frictionCoef: number;
    stuckPowerThresh: number;
    stuckAngularVelocityThresh: number;
  }) {
    this.maxTorque = maxTorque;
    this.frictionCoef = frictionCoef;
    this.stuckPowerThresh = stuckPowerThresh;
    this.stuckAngularVelocityThresh = stuckAngularVelocityThresh;
    this.curPower = 0;
  }

  setPower(power: number) {
    this.curPower = power;
  }

  step(deltaTime: number, motorAngularVelocity: number) {
    // if the power is under a certain threshold and the robot is "stopped",
    // the motor stalls and we stop applying any force
    if (
      Math.abs(motorAngularVelocity) < this.stuckAngularVelocityThresh &&
      Math.abs(this.curPower) < this.stuckPowerThresh
    ) {
      return {force: Vector.create(0, 0)};
    }
    // calculate the total force by setting the torque to a proportion of the power
    // but subtracting a friction force proportional to the velocity
    let totalXForce = Math.abs(this.curPower * this.maxTorque);
    //-motorAngularVelocity * this.frictionCoef;
    // set to zero if negative
    if (totalXForce < 0) totalXForce = 0;
    // preserve the sign
    if (this.curPower < 0) totalXForce = totalXForce * -1;
    return {force: Vector.create(totalXForce, 0)};
  }
}
