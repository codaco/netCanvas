import React from 'react';
import { omit, findKey, get } from 'lodash';
import { actionCreators as dialogActions } from './dialogs';
import { withErrorDialog } from './errors';
import deleteProtocol from '../../utils/protocol/deleteProtocol';

const IMPORT_PROTOCOL_COMPLETE = 'IMPORT_PROTOCOL_COMPLETE';
const IMPORT_PROTOCOL_FAILED = 'IMPORT_PROTOCOL_FAILED';
const DELETE_PROTOCOL = 'INSTALLED_PROTOCOLS/DELETE_PROTOCOL';

const initialState = {};

const protocolHasSessions = (state, protocolUID) => new Promise((resolve) => {
  const hasNotExportedSession = !!findKey(
    state.sessions,
    (session) => session.protocolUID === protocolUID && !session.exportedAt,
  );

  const hasSession = !!findKey(
    state.sessions,
    (session) => session.protocolUID === protocolUID,
  );

  const protocolName = get(state, ['installedProtocols', protocolUID, 'name'], null);

  resolve({ hasSession, hasNotExportedSession, protocolName });
});

const hasNonExportedSessionDialog = (protocolName) => ({
  type: 'Warning',
  title: `Interviews using '${protocolName}' have not been exported`,
  message: (
    <>
      <p>
        There are interview sessions on this device using the protocol &apos;
        {protocolName}
        &apos; that have
        not yet been exported.
      </p>
      <p><strong>Deleting this protocol will also delete these sessions.</strong></p>
    </>
  ),
  confirmLabel: 'Delete protocol and sessions',
});

const hasSessionDialog = (protocolName) => ({
  type: 'Confirm',
  title: `Interviews using ${protocolName}`,
  message: (
    <>
      <p>
        There are interview sessions on this device that use the protocol &apos;
        {protocolName}
        &apos;.
      </p>
      <p><strong>Deleting this protocol will also delete these sessions.</strong></p>
    </>
  ),
  confirmLabel: 'Delete protocol and sessions',
});

const deleteProtocolAction = (protocolUID) => (dispatch, getState) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  protocolHasSessions(getState(), protocolUID)
    .then(({ hasSession, hasNotExportedSession, protocolName }) => {
      if (hasNotExportedSession) {
        return dispatch(dialogActions.openDialog(hasNonExportedSessionDialog(protocolName)));
      }

      if (hasSession) {
        return dispatch(dialogActions.openDialog(hasSessionDialog(protocolName)));
      }

      return Promise.resolve(true);
    })
    .then((confirmed) => {
      if (!confirmed) { return; }
      deleteProtocol(protocolUID).then(() => dispatch({ type: DELETE_PROTOCOL, protocolUID }));
    });

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DELETE_PROTOCOL:
      return omit(state, [action.protocolUID]);
    case IMPORT_PROTOCOL_COMPLETE: {
      const newProtocol = action.protocolData;

      // If the protocol name (which is the true UID of protocol) already exists,
      // overwrite. We only get here after user has confirmed.
      const existingIndex = findKey(state, (protocol) => protocol.name === newProtocol.name);

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

const importProtocolFailedAction = withErrorDialog((error) => ({
  type: IMPORT_PROTOCOL_FAILED,
  error,
}));

const actionTypes = {
  DELETE_PROTOCOL,
  IMPORT_PROTOCOL_COMPLETE,
  IMPORT_PROTOCOL_FAILED,
};

const actionCreators = {
  deleteProtocol: deleteProtocolAction,
  importProtocolCompleteAction,
  importProtocolFailedAction,
};

export {
  actionCreators,
  actionTypes,
};
