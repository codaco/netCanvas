const UPDATE_PROGRESS = 'UPDATE_PROGRESS';
const RESET = 'RESET';

const initialState = {
  percentProgress: 0,
  statusText: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET:
      return initialState;
    case UPDATE_PROGRESS: {
      const { statusText, percentProgress } = action;

      return {
        statusText,
        percentProgress,
      };
    }
    default:
      return state;
  }
}

function update({ statusText, percentProgress }) {
  return {
    type: UPDATE_PROGRESS,
    statusText,
    percentProgress,
  };
}

function reset() {
  return {
    type: RESET,
  };
}

const actionCreators = {
  update,
  reset,
};

const actionTypes = {
  UPDATE_PROGRESS,
  RESET,
};

export {
  actionCreators,
  actionTypes,
};
