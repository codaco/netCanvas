/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import { createStore, applyMiddleware } from 'redux';
import thunks from 'redux-thunk';
import reducer, { actionCreators, actionTypes } from '../installedProtocols';
import deleteProtocol from '../../../utils/protocol/deleteProtocol';
import { actionCreators as dialogsActions } from '../dialogs';

jest.mock('../dialogs');
jest.mock('../../../utils/protocol/deleteProtocol', () => jest.fn(() => Promise.resolve(true)));

const testMiddleware = (actionListener) => () => (next) => (action) => {
  actionListener(action);
  return next(action);
};

const mockState = {
  installedProtocols: {
    abcd: {
      name: 'Mock Protocol',
    },
  },
};

const getStore = (actionListener, initialState) => (
  createStore(reducer, initialState, applyMiddleware(thunks, testMiddleware(actionListener)))
);

describe('protocols reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual({});
  });

  describe('deleteProtocolAction()', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    const protocolUID = 'abcd';

    it('DELETE_PROTOCOL action should remove item from installedProtocols', () => {
      const action = {
        type: actionTypes.DELETE_PROTOCOL,
        protocolUID,
      };

      const result = reducer(
        {
          [protocolUID]: { uid: protocolUID },
        },
        action,
      );

      expect(result).toEqual({});
    });

    it('deletes protocol when there are no existing sessions', () => {
      const actionListener = jest.fn();

      const store = getStore(actionListener);
      store.dispatch(actionCreators.deleteProtocol(protocolUID));

      const state = store.getState();

      expect(state).toMatchObject({});
    });

    describe('Has existing sessions', () => {
      it('warns user about existing sessions', (done) => {
        const actionListener = jest.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(false),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID, exportedAt: Date.now() },
          ],
          ...mockState,
        });
        store.dispatch(actionCreators.deleteProtocol(protocolUID));

        setImmediate(() => {
          expect(dialogsActions.openDialog.mock.calls).toMatchSnapshot();
          expect(deleteProtocol.mock.calls.length).toBe(0);
          done();
        });
      });

      it('warns user about existing sessions, but allows deletion on confirm', (done) => {
        const actionListener = jest.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(true),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID, exportedAt: Date.now() },
          ],
          ...mockState,
        });
        store.dispatch(actionCreators.deleteProtocol(protocolUID));

        setImmediate(() => {
          expect(deleteProtocol.mock.calls.length).toBe(1);
          done();
        });
      });
    });

    describe('Has non-exported existing sessions', () => {
      it('warns user about existing sessions', (done) => {
        const actionListener = jest.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(false),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID },
          ],
          ...mockState,
        });
        store.dispatch(actionCreators.deleteProtocol(protocolUID));

        setImmediate(() => {
          expect(dialogsActions.openDialog.mock.calls).toMatchSnapshot();
          expect(deleteProtocol.mock.calls.length).toBe(0);
          done();
        });
      });

      it('warns user about existing sessions, but allows deletion on confirm', (done) => {
        const actionListener = jest.fn();

        dialogsActions.openDialog.mockImplementationOnce(
          () => () => Promise.resolve(true),
        );

        const store = getStore(actionListener, {
          sessions: [
            { protocolUID },
          ],
          ...mockState,
        });
        store.dispatch(actionCreators.deleteProtocol(protocolUID));

        setImmediate(() => {
          expect(deleteProtocol.mock.calls.length).toBe(1);
          done();
        });
      });
    });
  });
});
