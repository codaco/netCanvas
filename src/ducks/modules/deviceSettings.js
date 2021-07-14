import { deviceDescription, shouldUseDynamicScaling } from '../../utils/DeviceInfo';

const SET_DESCRIPTION = 'SETTINGS/SET_DESCRIPTION';
const SET_INTERFACE_SCALE = 'SETTINGS/SET_INTERFACE_SCALE';
const TOGGLE_SETTING = 'SETTINGS/TOGGLE_SETTING';
const SET_SETTING = 'SETTINGS/SET_SETTING';
const DEVICE_READY = 'DEVICE_READY';

// getDeviceReadyState() may provide better defaults once more is known about the device.
// Static defaults should be distinguishable from user choices (e.g., undefined instead of false).
const initialState = {
  description: 'Unknown device',
  useDynamicScaling: undefined,
  // useFullScreenForms defaults to false, leave using full screen forms up to user
  useFullScreenForms: false,
  interfaceScale: 100,
  startFullScreen: false,

  // Start screen
  showGettingStarted: true,
  showWhatsNew: false, // Disabled for initial release

  // Export Options
  exportGraphML: true,
  exportCSV: true,
  unifyNetworks: false,
  useScreenLayoutCoordinates: false,
  screenLayoutHeight: window.screen.height,
  screenLayoutWidth: window.screen.width,

  // We are required to show a dialog on app launch for iOS users
  crappleWarningHeeded: false,

  // Experimental TTS feature for reading prompts
  enableExperimentalTTS: false,
};

// This provides additional default state based on information unavailable before 'deviceready'.
// Rehydration may occur before this, so only overwrite static default values.
const getDeviceReadyState = (state) => {
  let { description } = state;
  let { useDynamicScaling } = state;
  if (description === initialState.description) {
    description = deviceDescription();
  }
  if (useDynamicScaling === initialState.useDynamicScaling) {
    useDynamicScaling = shouldUseDynamicScaling();
  }

  return {
    ...state,
    description,
    useDynamicScaling,

  };
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DEVICE_READY:
      return getDeviceReadyState(state);
    case SET_DESCRIPTION:
      return {
        ...state,
        description: action.description,
      };
    case SET_INTERFACE_SCALE:
      return {
        ...state,
        interfaceScale: action.scale,
      };
    case TOGGLE_SETTING:
      return {
        ...state,
        [action.item]: !state[action.item],
      };
    case SET_SETTING:
      return {
        ...state,
        [action.setting]: action.value,
      };
    default:
      return state;
  }
}

const deviceReady = () => ({
  type: DEVICE_READY,
});

const setDescription = (description) => ({
  type: SET_DESCRIPTION,
  description,
});

const setInterfaceScale = (scale) => ({
  type: SET_INTERFACE_SCALE,
  scale,
});

const toggleSetting = (item) => ({
  type: TOGGLE_SETTING,
  item,
});

const setSetting = (setting, value) => ({
  type: SET_SETTING,
  setting,
  value,
});

const actionCreators = {
  deviceReady,
  setDescription,
  setInterfaceScale,
  toggleSetting,
  setSetting,
};

const actionTypes = {
  DEVICE_READY,
  SET_DESCRIPTION,
  SET_INTERFACE_SCALE,
  TOGGLE_SETTING,
  SET_SETTING,
};

export {
  actionCreators,
  actionTypes,
};
