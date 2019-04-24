/* eslint-disable import/prefer-default-export */

import { combineEpics } from 'redux-observable';
// import { Observable } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';
import { actionCreators as dialogActions } from './dialogs';
import { actionTypes as importProtocolActionTypes } from './importProtocol';
import { actionTypes as serverActionTypes } from './pairedServer';
import { actionTypes as sessionsActionTypes } from './sessions';

const errorActions = [
  importProtocolActionTypes.IMPORT_PROTOCOL_FAILED,
  serverActionTypes.SERVER_PAIRING_FAILED,
  sessionsActionTypes.EXPORT_SESSION_FAILED,
];


const errorsEpic = action$ => action$.pipe(
  filter(action => errorActions.includes(action.type)),
  mapTo(action => dialogActions.openDialog({ type: 'Error', error: action.error })),
);

const epics = combineEpics(
  errorsEpic,
);

export {
  epics,
};
