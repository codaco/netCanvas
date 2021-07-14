/* eslint-env jest */
import reducer, { actionCreators, actionTypes } from '../deviceSettings';

const initialState = {
  crappleWarningHeeded: false,
  description: 'Unknown device',
  enableExperimentalTTS: false,
  exportCSV: true,
  exportGraphML: true,
  interfaceScale: 100,
  screenLayoutHeight: 0,
  screenLayoutWidth: 0,
  showGettingStarted: true,
  showWhatsNew: false,
  startFullScreen: false,
  unifyNetworks: false,
  useDynamicScaling: undefined,
  useFullScreenForms: false,
  useScreenLayoutCoordinates: false,
};
const mockDescription = 'My Android Tablet';
const mockSettingToToggle = 'useDynamicScaling';
const mockInterfaceScale = 80;

describe('deviceSettings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe('Cordova', () => {
    beforeEach(() => {
      global.cordova = {};
    });

    it('provides better Android defaults after device_ready', () => {
      global.device = { platform: 'Android', isVirtual: true };
      const newState = reducer(initialState, { type: actionTypes.DEVICE_READY });
      expect(newState.description).toMatch('Android');
      expect(newState.useDynamicScaling).toBe(false);
    });

    it('provides better iOS defaults after device_ready', () => {
      global.device = { platform: 'iOS', isVirtual: true };
      const newState = reducer(initialState, { type: actionTypes.DEVICE_READY });
      expect(newState.description).toMatch('iOS');
      expect(newState.useDynamicScaling).toBe(false);
    });
  });

  it('should return a device description', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.SET_DESCRIPTION, description: mockDescription });
    expect(reduced).toEqual({ ...initialState, description: mockDescription });
  });

  it('should toggle a device setting', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.TOGGLE_SETTING, item: mockSettingToToggle });
    expect(reduced).toEqual({
      ...initialState,
      [mockSettingToToggle]: !initialState[mockSettingToToggle],
    });
  });

  it('should set an interface scale', () => {
    const reduced = reducer(initialState,
      { type: actionTypes.SET_INTERFACE_SCALE, scale: mockInterfaceScale });
    expect(reduced).toEqual({ ...initialState, interfaceScale: mockInterfaceScale });
  });
});

describe('device actions', () => {
  it('should set a description', () => {
    const expectedAction = { type: actionTypes.SET_DESCRIPTION, description: mockDescription };
    expect(actionCreators.setDescription(mockDescription)).toEqual(expectedAction);
  });

  it('should toggle a setting', () => {
    const expectedAction = { type: actionTypes.TOGGLE_SETTING, item: mockSettingToToggle };
    expect(actionCreators.toggleSetting(mockSettingToToggle)).toEqual(expectedAction);
  });

  it('should set interface scale', () => {
    const expectedAction = { type: actionTypes.SET_INTERFACE_SCALE, scale: mockInterfaceScale };
    expect(actionCreators.setInterfaceScale(mockInterfaceScale)).toEqual(expectedAction);
  });
});
