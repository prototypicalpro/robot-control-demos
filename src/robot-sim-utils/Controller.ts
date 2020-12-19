export interface Controller {
  step(sensorDistance: number, time: number, delta: number): number;
}

export interface ControllerFactory {
  new (): Controller;
}
