import * as React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import AutoSizer from './AutoSizer';
import SlideShow, {Slide} from './SlideShow';
import RobotSim from './RobotSim';

const SLIDE_COUNT = 6;

const NO_CONTROLLER = `
class Controller {
  step() {
    return 1
  }
}`.trim();

const TIME_CONTROLLER = `
class Controller {
  constructor() {
    this.initialTime = null
  }

  step({time}) {
    if (this.initialTime === null)
      this.initialTime = time
    const timeHasPassed = time - this.initialTime
    if (timeHasPassed > 2000) return 0
    else return 1
  }
}`.trim();

const BANG_BANG_CONTROLLER = `
class Controller {
  step({sensorDistance}) {
    if (sensorDistance > 0) return 1
    else if (sensorDistance < 0) return -1
    else return 0
  }
}`.trim();

const ALL_SLIDES: Slide[] = [
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#ff0000'}]}
      initialCode={NO_CONTROLLER}
      active={active}
    />
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[
        {powerCoef: 1, color: '#ff0000'},
        {powerCoef: 0.9, color: '#00ff00'},
        {powerCoef: 0.8, color: '#0000ff'}
      ]}
      initialCode={TIME_CONTROLLER}
      active={active}
    />
  ),
  () => (
    <Carousel.Caption>
      <h3>First slide label</h3>
      <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
    </Carousel.Caption>
  ),
  () => (
    <Carousel.Caption>
      <h3>First slide label</h3>
      <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
    </Carousel.Caption>
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#ff0000'}]}
      initialCode={BANG_BANG_CONTROLLER}
      active={active}
    />
  )
];

export default function Page() {
  // TODO: detect resize?

  return (
    <AutoSizer>
      {({width, height}) => (
        <SlideShow
          width={width}
          height={height}
          style={{width: '100%', height: '100%'}}
        >
          {ALL_SLIDES}
        </SlideShow>
      )}
    </AutoSizer>
  );
}
