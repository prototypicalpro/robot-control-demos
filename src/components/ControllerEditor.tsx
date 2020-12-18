import * as React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import {ControllerFactory} from '../robot-sim-utils/Controller';

const CODE_DEFAULT = `
class Controller {
  constructor() {

  }

  step(sensorDistance, time, delta) {
    return 1
  }

  reset() {

  }
}`.trim();

export default function ControllerEditor({
  onCodeSubmit,
  onPause,
  style = {}
}: {
  onCodeSubmit: (code: ControllerFactory) => void;
  running: boolean,
  style?: React.CSSProperties;
}) {
  const [code, setCode] = React.useState(CODE_DEFAULT);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
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
          flexGrow: 2,
          width: '100%',
          overflowY: 'scroll'
        }}
      />
      <span>
        <Button variant="primary" size="lg">
          Run
        </Button>{' '}
        <Button variant="primary" size="lg">
          Pause
        </Button>{' '}
        <Button variant="primary" size="lg">
          Reset
        </Button>
      </span>
    </div>
  );
}
