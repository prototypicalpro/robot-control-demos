import * as React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import useKeyPress from '../robot-sim-utils/useKeyPress';

export type Slide = (param: {
  width: number;
  height: number;
  active: boolean;
}) => React.ReactNode;

export default function SlideShow({
  width,
  height,
  children,
  style,
  className
}: {
  width: number;
  height: number;
  children: Slide[];
  style?: React.CSSProperties;
  className?: string;
}) {
  const [index, setIndex] = React.useState(0);
  const [keyUpIndex, setKeyUpIndex] = React.useState(0);
  const shiftPressed = useKeyPress(
    new Set(['ShiftLeft', 'ShiftRight', 'Shift'])
  );
  const arrowLeftPressed = useKeyPress(new Set(['ArrowLeft']));
  const arrowRightPressed = useKeyPress(new Set(['ArrowRight']));

  React.useEffect(() => {
    if (!shiftPressed) setKeyUpIndex(index);
    else if (keyUpIndex === index) {
      if (arrowRightPressed && index < children.length - 1) setIndex(index + 1);
      else if (arrowLeftPressed && index > 0) setIndex(index - 1);
    }
  }, [
    shiftPressed,
    index,
    arrowLeftPressed,
    arrowRightPressed,
    children.length,
    keyUpIndex
  ]);

  const slides = React.useMemo(
    () =>
      children.map((c, i) => (
        <Carousel.Item key={i}>
          {c({width, height, active: index === i})}
        </Carousel.Item>
      )),
    [children, height, index, width]
  );

  return (
    <Carousel
      activeIndex={index}
      onSelect={setIndex}
      interval={null}
      indicators={false}
      controls={false}
      fade={true}
      style={style}
      className={className}
    >
      {slides}
    </Carousel>
  );
}
