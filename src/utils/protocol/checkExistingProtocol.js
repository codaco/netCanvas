import { CancellationError } from 'builder-util-runtime';
import { findKey } from 'lodash';

import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import {
  removeDirectory,
  rename,
} from '../filesystem';
import protocolPath from './protocolPath';

const renameProtocol = (previousUuid, currentUuid) => {
  // delete contents of previous uuid, and move current content directory to previous uuid location
  const previousDir = protocolPath(previousUuid);
  const currentDir = protocolPath(currentUuid);

  return removeDirectory(previousDir)
  .then(() => rename(currentDir, previousDir));
}

const checkExistingSession = (dispatch, state, protocolContent) => {
  const existingIndex = findKey(state.installedProtocols,
    protocol => protocol.name === protocolContent.name);
  const unExportedSession = findKey(state.sessions,
    session => session.protocolUID === existingIndex && !session.lastExportedAt);
  if (unExportedSession) {
    const message = 'This protocol is already installed. In progress sessions for a previous version of this protocol have not yet been exported. Please export them before attempting to overwrite the protocol.';
    return Promise.reject(new Error(message));
  }

  const existingSession = findKey(state.sessions,
    session => session.protocolUID === existingIndex);
  if (existingSession) {
    return new Promise((resolve, reject) => dispatch(dialogActions.openDialog({
      type: 'Warning',
      title: 'Overwrite existing protocol?',
      confirmLabel: 'Overwrite protocol',
      onConfirm: () => {
        renameProtocol(existingIndex, protocolContent.uid)
        .then(() => resolve(protocolContent));
      },
      onCancel: () => reject(new CancellationError('Installation of this protocol cancelled.')),
      message: 'This protocol is already installed; all in progress sessions have been exported. Overwriting the previous installation of this protocol may limit access to previously created sessions.',
    })));
  }
  
  if (existingIndex) {
    // clean up protocol even if no sessions exist
    return renameProtocol(existingIndex, protocolContent.uid)
      .then(() => Promise.resolve(protocolContent));
  }

  return Promise.resolve(protocolContent);
}

export default checkExistingSession;
