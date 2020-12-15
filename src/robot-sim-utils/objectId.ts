import {Common} from 'matter-js';

enum OBJECT_ID {
  CAR_BODY = Common.nextId(),
  CAR_WHEEL_FRONT = Common.nextId(),
  CAR_WHEEL_BACK = Common.nextId(),
  SENSOR_B = Common.nextId()
}

export default OBJECT_ID;
