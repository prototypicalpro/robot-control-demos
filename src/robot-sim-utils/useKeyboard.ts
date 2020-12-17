import * as React from 'react';

function keyboardReducer(
  state: string[],
  {type, code}: {type: string; code: string}
) {
  if (type === 'keydown') {
    if (!state.includes(code)) return state.concat([code]);
    else return state;
  } else if (type === 'keyup') {
    return state.filter(s => s !== code);
  } else throw new Error(`Invalid keyboardReducer action ${type}`);
}

export default function useKeyboard() {
  const [keysPressed, dispatchKeysPressed] = React.useReducer(
    keyboardReducer,
    []
  );
  React.useEffect(() => {
    const downHandler = ({code}: KeyboardEvent) =>
      dispatchKeysPressed({type: 'keydown', code});
    const upHandler = ({code}: KeyboardEvent) =>
      dispatchKeysPressed({type: 'keyup', code});
    window.addEventListener('keydown', downHandler, {passive: true});
    window.addEventListener('keyup', upHandler, {passive: true});
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);
  return keysPressed;
}
