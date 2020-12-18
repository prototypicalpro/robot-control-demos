export interface Controller {
  step(sensorDistance: number, time: number, delta: number): number;
  reset(): void;
}

export interface ControllerFactory {
  new (): Controller;
}
