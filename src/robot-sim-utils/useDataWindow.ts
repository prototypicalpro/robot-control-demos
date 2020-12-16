import * as React from 'react';

function windowReducer<Data>(
  size: number,
  {data: state}: {data: Data[]},
  {action, data}: {action: 'add' | 'clear'; data?: Data}
): {data: Data[]} {
  if (action === 'clear') return {data: []};
  else if (action === 'add' && data) {
    if (state.length > size) return {data: state.concat([data]).slice(1)}
    return {data: state.concat([data])};
  } else throw new Error(`Invalid windowReducer command ${action}`);
}

export default function useDataWindow<Data>(size: number) {
  const reducerFunc = React.useCallback(
    (state: {data: Data[]}, action: {action: 'add' | 'clear'; data?: Data}) =>
      windowReducer(size, state, action),
    [size]
  );
  return React.useReducer(reducerFunc, {data: []});
}
