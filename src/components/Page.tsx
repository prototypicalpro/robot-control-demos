import * as React from 'react';
import AutoSizer from './AutoSizer';
import SlideShow, {Slide} from './SlideShow';
import RobotSim from './RobotSim';
import './Page.css';

const NO_CONTROLLER = `
class Controller {
  step() {
    return 0
  }
}`.trim();

const TIME_CONTROLLER_INITIAL = `
const DRIVE_TIME = 0;

class Controller {
  constructor() {
    this.initialTime = null
  }

  step({time}) {
    if (this.initialTime === null)
      this.initialTime = time
    const timeHasPassed = time - this.initialTime
    if (timeHasPassed > DRIVE_TIME) return 0
    else return 1
  }
}`.trim();

const TIME_CONTROLLER = `
const DRIVE_TIME = 1.8;

class Controller {
  constructor() {
    this.initialTime = null
  }

  step({time}) {
    if (this.initialTime === null)
      this.initialTime = time
    const timeHasPassed = time - this.initialTime
    if (timeHasPassed > DRIVE_TIME) return 0
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

const P_CONTROLLER = `
const P_TERM = 0;

class Controller {
  step({sensorDistance}) {
    return sensorDistance*P_TERM;
  }
}`.trim();

const PI_CONTROLLER = `
const P_TERM = 0.003;
const I_TERM = 0;
const I_CUTOFF = 0;

class Controller {
  constructor() {
    this.integral = 0
  }

  step({sensorDistance, delta}) {
    if (Math.abs(sensorDistance) > I_CUTOFF) {
      this.integral = 0
    }
    else {
      this.integral += sensorDistance*delta
    }

    return sensorDistance*P_TERM + this.integral*I_TERM
  }
}`.trim();

const PID_CONTROLLER = `
const P_TERM = 0.003, I_TERM = 0.001, I_CUTOFF = 20, D_TERM = 0;

class Controller {
  constructor() { this.integral = 0, this.prevDistance = null }

  step({sensorDistance, delta}) {
    if (this.prevDistance === null) this.prevDistance = sensorDistance

    if (Math.abs(sensorDistance) > I_CUTOFF) this.integral = 0
    else this.integral += sensorDistance * delta

    let der = (sensorDistance - this.prevDistance) / delta
    this.prevDistance = sensorDistance

    return sensorDistance*P_TERM + this.integral*I_TERM + der*D_TERM
  }
}`.trim();

const PID_CONTROLLER_COMPLETE = `
const P_TERM = 0.003, I_TERM = 0.001, I_CUTOFF = 20, D_TERM = .003;

class Controller {
  constructor() { this.integral = 0, this.prevDistance = null }

  step({sensorDistance, delta}) {
    if (this.prevDistance === null) this.prevDistance = sensorDistance

    if (Math.abs(sensorDistance) > I_CUTOFF) this.integral = 0
    else this.integral += sensorDistance * delta

    let der = (sensorDistance - this.prevDistance) / delta
    this.prevDistance = sensorDistance

    return sensorDistance*P_TERM + this.integral*I_TERM + der*D_TERM
  }
}`.trim();

const MOTION_PROFILE_CONTROLLER = `
const CRUISE_VELOCITY = 200, MAX_ACCEL = 200, CORNER_TIME = CRUISE_VELOCITY / MAX_ACCEL;
const V_TERM = 0.0013, P_TERM = -0.004;

class Controller {
  constructor() { this.totalDistance = null; this.initialTime = null; }

  getDesiredVelocityAndPosition(time) {
    const cruiseDistance =
      this.totalDistance - CRUISE_VELOCITY * CORNER_TIME;
    const cruiseTime = cruiseDistance / CRUISE_VELOCITY;
    const backCornerTime = CORNER_TIME + cruiseTime;

    let velocity;
    if (time < CORNER_TIME) {
      velocity = (CRUISE_VELOCITY / CORNER_TIME) * time;
    } else if (time < backCornerTime) {
      velocity = CRUISE_VELOCITY;
    } else {
      velocity = Math.max(
        (CRUISE_VELOCITY / CORNER_TIME) * (backCornerTime - time) +
          CRUISE_VELOCITY,
        0
      );
    }

    let position;
    if (time < CORNER_TIME) position = 0.5 * MAX_ACCEL * Math.pow(time, 2);
    else if (time < backCornerTime)
      position = 0.5 * MAX_ACCEL * Math.pow(CORNER_TIME, 2) + CRUISE_VELOCITY * (time - CORNER_TIME);
    else if (time < backCornerTime + CORNER_TIME)
      position =
        0.5 * MAX_ACCEL * Math.pow(CORNER_TIME, 2) +
        CRUISE_VELOCITY * cruiseTime +
        CRUISE_VELOCITY * (time - backCornerTime) - 0.5 * MAX_ACCEL * Math.pow(time - backCornerTime, 2);
    else position = this.totalDistance

    console.log(time, position)
    return {position, velocity};
  }

  step({sensorDistance, delta, time}) {
    if (this.totalDistance === null) {
      this.totalDistance = sensorDistance;
      this.initialTime = time;
    }

    const {position, velocity} = this.getDesiredVelocityAndPosition((time - this.initialTime));
    const error = (this.totalDistance - position) - sensorDistance;
    return V_TERM*velocity + P_TERM*error;
  }
}
`.trim();

const ALL_SLIDES: Slide[] = [
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="title-slide"
    >
      <h1>How to get your Robot from point A to point B</h1>
      <h2>A talk by Noah Koontz</h2>
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">This slide is about me.</h1>
      <div className="image-div me-with-robot-marked"></div>
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">This slide is about me.</h1>
      <iframe
        title="autoVid"
        src="https://drive.google.com/file/d/0BxpTsJb9LFiVMDFTeXZQS0ZVMkE/preview"
        className="image-div"
        width={width - 160}
        height={height - 250}
      ></iframe>
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">
        You are building the software for the Beaver delivery bot.
      </h1>
      <div
        className="image-div beaver-bot image-half"
        style={{gridColumn: 'span 4'}}
      />
      <div
        className="image-div image-half point-list-container"
        style={{gridColumn: 'span 2', padding: 20}}
      >
        <ul>
          <li>Use the provided robot hardware.</li>
          <li>Run entirely autonomously (without user intervention).</li>
          <li>
            Get from point A to point B. The distance between point A and point
            B is fixed.
          </li>
        </ul>
      </div>
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">About the Beaver delivery bot</h1>
      <div
        className="image-div beaver-bot-closer image-half"
        style={{gridColumn: 'span 4'}}
      />
      <div
        className="image-div image-half point-list-container"
        style={{gridColumn: 'span 2', padding: 20}}
      >
        <ul>
          <li>
            <del>Six</del> Two wheels each driven by a DC motor powered by an
            internal battery.
          </li>
          <li>A millisecond clock.</li>
          <li>
            <del>A sensor measuring the distance to point B.</del>
          </li>
          <li>
            <del>A flag.</del>
          </li>
        </ul>
      </div>
    </div>
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={NO_CONTROLLER}
      active={active}
    />
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={TIME_CONTROLLER_INITIAL}
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
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">Never trust a robot to behave consistently</h1>
      <div
        className="image-div bad-bot image-half"
        style={{gridColumn: 'span 4'}}
      />
      <div
        className="image-div image-half point-list-container"
        style={{gridColumn: 'span 2', padding: 20}}
      >
        <ul>
          <li>
            Battery voltage, motor quality, weight changes, and more can cause
            the robot to behave differently
          </li>
          <li>
            In other words, we cannot assume that 1.0 power is the same for
            every robot.
          </li>
        </ul>
      </div>
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">
        Control Theory: Open-loop vs. closed-loop system
      </h1>
      <div className="image-div loop-system" />
    </div>
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={BANG_BANG_CONTROLLER}
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
      initialCode={BANG_BANG_CONTROLLER}
      active={active}
    />
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={P_CONTROLLER}
      active={active}
    />
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={PI_CONTROLLER}
      active={active}
    />
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={PID_CONTROLLER}
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
      initialCode={PID_CONTROLLER_COMPLETE}
      active={active}
    />
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">Feedback vs. feedforward</h1>
      <div className="image-div feedfoward" />
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">
        A motion profile describes the desired position of the robot at every
        point in time.
      </h1>
      <div
        className="image-div motion-profile image-half"
        style={{gridColumn: 'span 4'}}
      />
      <div
        className="image-div image-half point-list-container"
        style={{gridColumn: 'span 2', padding: 20}}
      >
        <ul>
          <li>
            Using a desitination and some contraints about our robot, we can
            build a model describing our path.
          </li>
          <li>
            This model can then be used to "feedforward" into our controller.
          </li>
        </ul>
      </div>
    </div>
  ),
  ({width, height, active}) => (
    <RobotSim
      width={width}
      height={height}
      cars={[{powerCoef: 1, color: '#FFA500'}]}
      initialCode={MOTION_PROFILE_CONTROLLER}
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
      initialCode={MOTION_PROFILE_CONTROLLER}
      active={active}
    />
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="text-image-slide-container"
    >
      <h1 className="title-text">Motion profiling in action</h1>
      <iframe
        title="motion profiling"
        width={width - 160}
        height={height - 250}
        src="https://www.youtube.com/embed/FUh36RUHzdU?start=6"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  ),
  ({width, height}) => (
    <div
      style={{
        width,
        height
      }}
      className="title-slide"
    >
      <h1>Questions?</h1>
      <h2>Now you too are burdened with this knowledge.</h2>
    </div>
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
