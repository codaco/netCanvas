import React, { Fragment } from 'react';
import { omit, findKey } from 'lodash';
import { actionCreators as dialogActions } from './dialogs';
import deleteProtocol from '../../utils/protocol/deleteProtocol';

const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const DELETE_PROTOCOL = 'INSTALLED_PROTOCOLS/DELETE_PROTOCOL';

const initialState = {};

const protocolHasSessions = (state, protocolUID) =>
  new Promise((resolve) => {
    const hasNotExportedSession = !!findKey(
      state.sessions,
      session => session.protocolUID === protocolUID && !session.lastExportedAt,
    );

    const hasSession = !!findKey(
      state.sessions,
      session => session.protocolUID === protocolUID,
    );

    resolve({ hasSession, hasNotExportedSession });
  });

const confirmDeleteDialog = {
  type: 'Confirm',
  title: 'Are you sure?',
  message: 'Are you sure you want to delete this protocol?',
  confirmLabel: 'Delete protocol',
};

const hasNonExportedSessionDialog = {
  type: 'Warning',
  title: 'Interviews using protocol have not been exported',
  message: (
    <Fragment>
      <p>
        There are interview sessions on this device using this protocol that have
        not yet been exported.
      </p>
      <p><strong>Deleting this protocol will also delete these sessions.</strong></p>
    </Fragment>
  ),
  confirmLabel: 'Delete protocol and sessions',
};

const hasSessionDialog = {
  type: 'Confirm',
  title: 'Interviews using this protocol',
  message: (
    <Fragment>
      <p>There are interview sessions on this device that use this protocol.</p>
      <p><strong>Deleting this protocol will also delete these sessions.</strong></p>
    </Fragment>
  ),
  confirmLabel: 'Delete protocol and sessions',
};

const deleteProtocolAction = protocolUID =>
  (dispatch, getState) =>
    protocolHasSessions(getState(), protocolUID)
      .then(({ hasSession, hasNotExportedSession }) => {
        if (hasNotExportedSession) {
          return dispatch(dialogActions.openDialog(hasNonExportedSessionDialog));
        }

        if (hasSession) {
          return dispatch(dialogActions.openDialog(hasSessionDialog));
        }

        return dispatch(dialogActions.openDialog(confirmDeleteDialog));
      })
      .then((confirmed) => {
        if (!confirmed) { return; }

        dispatch({ type: DELETE_PROTOCOL, protocolUID });
        deleteProtocol(protocolUID);
      });

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DELETE_PROTOCOL:
      return omit(state, [action.protocolUID]);
    case IMPORT_PROTOCOL_COMPLETE: {
      const newProtocol = action.protocolData;

      // If the protocol name (which is the true UID of protocol) already exists,
      // overwrite. We only get here after user has confirmed.
      const existingIndex = findKey(state, protocol => protocol.name === newProtocol.name);

      if (existingIndex) {
        return {
          ...state,
          [existingIndex]: {
            ...omit(newProtocol, 'uid'),
            installationDate: Date.now(),
          },
        };
      }

      return {
        ...state,
        [newProtocol.uid]: {
          ...omit(newProtocol, 'uid'),
          installationDate: Date.now(),
        },
      };
    }
    default:
      return state;
  }
}

function importProtocolCompleteAction(protocolData) {
  return {
    type: IMPORT_PROTOCOL_COMPLETE,
    protocolData,
  };
}

const actionTypes = {
  DELETE_PROTOCOL,
  IMPORT_PROTOCOL_COMPLETE,
};

const actionCreators = {
  deleteProtocol: deleteProtocolAction,
  importProtocolCompleteAction,
};

export {
  actionCreators,
  actionTypes,
};
