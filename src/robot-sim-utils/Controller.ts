export interface Controller {
  step(data: {time: number; delta: number; sensorDistance: number}): number;
}

export interface ControllerFactory {
  new (): Controller;
}
