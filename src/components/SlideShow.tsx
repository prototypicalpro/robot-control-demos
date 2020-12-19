import * as React from 'react';
import Carousel from 'react-bootstrap/Carousel';

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
  const [shiftPressed, setShiftPressed] = React.useState(false);

  React.useEffect(() => {
    const downHandler = ({code}: KeyboardEvent) => {
      if (code === 'ArrowLeft' && index > 0 && shiftPressed)
        setIndex(index - 1);
      else if (
        code === 'ArrowRight' &&
        index < children.length - 1 &&
        shiftPressed
      )
        setIndex(index + 1);
      else if (code === 'ShiftLeft' || code === 'ShiftRight')
        setShiftPressed(true);
    };
    const upHandler = ({code}: KeyboardEvent) => {
      if (code === 'ShiftLeft' || code === 'ShiftRight') setShiftPressed(false);
    };
    window.addEventListener('keydown', downHandler, {passive: true});
    window.addEventListener('keyup', upHandler, {passive: true});
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [setIndex, shiftPressed, children.length, index]);

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
