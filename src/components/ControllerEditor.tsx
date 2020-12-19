import * as React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import {ControllerFactory} from '../robot-sim-utils/Controller';

const CODE_DEFAULT = `
class Controller {
  constructor() {

  }

  step(sensorDistance, time, delta) {
    return 1
  }
}`.trim();

export default function ControllerEditor({
  initialCode = CODE_DEFAULT,
  onCodeUpdate,
  style = {}
}: {
  onCodeUpdate: (code: ControllerFactory) => void;
  initialCode?: string;
  style?: React.CSSProperties;
}) {
  const [code, setCode] = React.useState(initialCode);
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    let Controller;
    try {
      // I know I know
      // eslint-disable-next-line no-new-func
      Controller = Function(`"use strict";return (${code})`)();
      const controllerInstance = new Controller();
      if (!(controllerInstance instanceof Controller))
        throw new Error('Not a class');
      if (!(controllerInstance.step instanceof Function))
        throw new Error('No step() function on class');
    } catch (e) {
      setError(e.toString().split('\n')[0]);
      return;
    }
    setError('');
    onCodeUpdate(Controller as ControllerFactory);
  }, [code, onCodeUpdate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      <Editor
        value={code}
        onValueChange={setCode}
        highlight={code =>
          Prism.highlight(code, Prism.languages.javascript, 'javascript')
        }
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 24,
          overflowY: 'auto',
          width: '100%',
          flexGrow: 2
        }}
      />
      <p>{error}</p>
    </div>
  );
}
