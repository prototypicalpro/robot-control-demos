import * as React from 'react';

export default function useKeyPress(targetKey: Set<string>) {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = React.useState(false);

  // Add event listeners
  React.useEffect(() => {
    // If pressed key is our target key then set to true
    const downHandler = ({code: key}: KeyboardEvent) => {
      if (targetKey.has(key)) {
        setKeyPressed(true);
      }
    };

    // If released key is our target key then set to false
    const upHandler = ({code: key}: KeyboardEvent) => {
      if (targetKey.has(key)) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}
