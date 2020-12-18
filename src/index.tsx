import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RobotSim from './components/RobotSim';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <RobotSim
      width={window.innerWidth}
      height={window.innerHeight}
      cars={[
        {powerCoef: 1, color: '#ff0000'},
        {powerCoef: 0.5, color: '#00ff00'},
        {powerCoef: 0.2, color: '#0000ff'}
      ]}
      style={{overflow: 'visible'}}
    />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
