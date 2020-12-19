export default class MotorModel {
  private readonly maxTorque: number;
  private readonly stuckPowerThresh: number;
  private readonly stuckAngularVelocityThresh: number;

  constructor({
    maxTorque,
    stuckPowerThresh,
    stuckAngularVelocityThresh
  }: {
    maxTorque: number;
    stuckPowerThresh: number;
    stuckAngularVelocityThresh: number;
  }) {
    this.maxTorque = maxTorque;
    this.stuckPowerThresh = stuckPowerThresh;
    this.stuckAngularVelocityThresh = stuckAngularVelocityThresh;
  }

  step(deltaTime: number, motorAngularVelocity: number, power: number) {
    // if the power is under a certain threshold and the robot is "stopped",
    // the motor stalls and we stop applying any force
    if (
      Math.abs(motorAngularVelocity) < this.stuckAngularVelocityThresh &&
      Math.abs(power) < this.stuckPowerThresh
    ) {
      return 0;
    }
    // calculate the total force by setting the torque to a proportion of the power
    // but subtracting a friction force proportional to the velocity
    let totalXForce = Math.abs(power * this.maxTorque);
    //-motorAngularVelocity * this.frictionCoef;
    // set to zero if negative
    if (totalXForce < 0) totalXForce = 0;
    // preserve the sign
    if (power < 0) totalXForce = totalXForce * -1;
    return totalXForce * deltaTime;
  }
}
