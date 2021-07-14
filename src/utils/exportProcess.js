import React from 'react';
import { batch } from 'react-redux';
import { Icon } from '@codaco/ui';
import { store } from '../ducks/store';
import { actionCreators as toastActions } from '../ducks/modules/toasts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../ducks/modules/dialogs';
import { actionCreators as exportProgressActions } from '../ducks/modules/exportProgress';
import { withErrorDialog } from '../ducks/modules/errors';
import ApiClient from './ApiClient';
import FileExportManager from './network-exporters/src/FileExportManager';
import { getRemoteProtocolID } from './networkFormat';

const { dispatch } = store;
const { getState } = store;

const setInitialExportStatus = () => {
  dispatch(exportProgressActions.update({
    statusText: 'Starting export...',
    percentProgress: 0,
  }));
};

const showCancellationToast = () => {
  dispatch(toastActions.addToast({
    type: 'warning',
    title: 'Export cancelled',
    content: (
      <>
        <p>You cancelled the export process.</p>
      </>
    ),
  }));
};

const fatalExportErrorAction = withErrorDialog((error) => ({
  type: 'SESSION_EXPORT_FATAL_ERROR',
  error,
}));

export const exportToFile = (sessionList, filename) => {
  // Reset exportProgress state
  dispatch(exportProgressActions.reset());

  const {
    installedProtocols,
    deviceSettings: {
      exportGraphML,
      exportCSV,
      unifyNetworks,
      useScreenLayoutCoordinates,
      screenLayoutHeight,
      screenLayoutWidth,
    },
  } = getState();

  const exportOptions = {
    exportGraphML,
    exportCSV,
    globalOptions: {
      exportFilename: filename,
      unifyNetworks,
      useScreenLayoutCoordinates,
      screenLayoutHeight,
      screenLayoutWidth,
    },
  };

  const errors = [];
  const succeeded = [];

  const fileExportManager = new FileExportManager(exportOptions);

  fileExportManager.on('begin', () => {
    // Create a toast to show the status as it updates
    setInitialExportStatus();
  });

  fileExportManager.on('update', ({ statusText, progress }) => {
    dispatch(exportProgressActions.update({
      statusText,
      percentProgress: progress,
    }));
  });

  fileExportManager.on('cancelled', () => {
    dispatch(exportProgressActions.reset());
    showCancellationToast();
  });

  fileExportManager.on('session-exported', (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string') {
      // eslint-disable-next-line no-console
      console.warn('session-exported event did not contain a sessionID');
      return;
    }
    succeeded.push(sessionId);
  });

  fileExportManager.on('error', (error) => {
    errors.push(error);
  });

  fileExportManager.on('finished', () => {
    dispatch(exportProgressActions.reset());

    if (succeeded.length > 0) {
      batch(() => {
        succeeded.forEach(
          (successfulExport) => dispatch(sessionsActions.setSessionExported(successfulExport)),
        );
      });
    }

    if (errors.length > 0) {
      const errorList = errors.map((error, index) => (
        <li key={index}>
          <Icon name="warning" />
          {' '}
          {error}
        </li>
      ));

      dispatch(dialogActions.openDialog({
        type: 'Warning',
        title: 'Errors encountered during export',
        canCancel: false,
        message: (
          <>
            <p>
              Your export completed, but non-fatal errors were encountered during the process. This
              may mean that not all sessions or all formats were able to be exported.
              Review the details of these errors below, and ensure that you check the data you
              received. Contact the Network Canvas team for support.
            </p>
            <strong>Errors:</strong>
            <ul className="export-error-list">{errorList}</ul>
          </>
        ),
      }));

      return;
    }

    dispatch(toastActions.addToast({
      type: 'success',
      title: 'Export Complete!',
      autoDismiss: true,
      content: (
        <>
          <p>Your sessions were exported successfully.</p>
        </>
      ),
    }));
  });

  // The protocol object needs to be reformatted so that it is keyed by
  // the sha of protocol.name, since this is what Server and network-exporters
  // use.
  const reformatedProtocols = Object.values(installedProtocols)
    .reduce((acc, protocol) => ({
      ...acc,
      [getRemoteProtocolID(protocol.name)]: protocol,
    }), {});

  return fileExportManager.exportSessions(sessionList, reformatedProtocols);
};

export const exportToServer = (sessionList) => {
  const errors = [];
  const succeeded = [];

  const { pairedServer } = getState();

  const client = new ApiClient(pairedServer);
  client.addTrustedCert();

  client.on('begin', () => {
    setInitialExportStatus();
  });

  client.on('update', ({ statusText, progress }) => {
    dispatch(exportProgressActions.update({
      statusText,
      percentProgress: progress,
    }));
  });

  client.on('session-exported', (sessionId) => {
    succeeded.push(sessionId);
  });

  client.on('error', (error) => {
    errors.push(error);
  });

  client.on('finished', () => {
    dispatch(exportProgressActions.reset());

    if (succeeded.length > 0) {
      batch(() => {
        succeeded.forEach(
          (successfulExport) => dispatch(sessionsActions.setSessionExported(successfulExport)),
        );
      });
    }

    if (errors.length > 0) {
      const errorList = errors.map((error, index) => (
        <li key={index}>
          <Icon name="warning" />
          {error}
        </li>
      ));

      dispatch(dialogActions.openDialog({
        type: 'Warning',
        title: 'Errors encountered during export',
        canCancel: false,
        message: (
          <>
            <p>
              Your export completed, but non-fatal errors were encountered during the process. This
              may mean that not all sessions were transferred to Server.
              Review the details of these errors below, and ensure that you check the data you
              received.
            </p>
            <strong>Errors:</strong>
            <ul className="export-error-list">{errorList}</ul>
          </>
        ),
      }));

      return;
    }

    dispatch(toastActions.addToast({
      type: 'success',
      title: 'Export Complete!',
      autoDismiss: true,
      content: (
        <>
          <p>Your sessions were exported successfully.</p>
        </>
      ),
    }));
  });

  const exportPromise = client.exportSessions(sessionList);

  exportPromise.catch((error) => {
    dispatch(fatalExportErrorAction(error));
    exportPromise.abort();
  });

  return exportPromise;
};
