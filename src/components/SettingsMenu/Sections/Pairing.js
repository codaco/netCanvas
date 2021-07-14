import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'connected-react-router';
import { motion } from 'framer-motion';
import { withHandlers, compose } from 'recompose';
import { Text } from '@codaco/ui/lib/components/Fields';
import { actionCreators as deviceSettingsActions } from '../../../ducks/modules/deviceSettings';
import { actionCreators as dialogsActions } from '../../../ducks/modules/dialogs';

const Pairing = (props) => {
  const {
    deviceDescription,
    setDeviceDescription,
  } = props;

  return (
    <>
      <motion.article className="settings-element--wide">
        <div>
          <h2>Device Name</h2>
          <p>This is the name that your device will appear as when pairing with Server.</p>
        </div>
        <Text
          input={{
            value: deviceDescription,
            onChange: (e) => setDeviceDescription(e.target.value),
          }}
          name="deviceName"
        />
      </motion.article>
    </>
  );
};

const pairingHandlers = withHandlers({
  handleResetAppData: (props) => () => {
    props.openDialog({
      type: 'Warning',
      title: 'Reset application data?',
      message: 'This will delete ALL data from Interviewer, including interview data and settings. Do you wish to continue?',
      onConfirm: () => {
        props.resetState();
      },
      confirmLabel: 'Reset Data',
    });
  },
});

const mapDispatchToProps = (dispatch) => ({
  openDialog: bindActionCreators(dialogsActions.openDialog, dispatch),
  resetState: () => dispatch(push('/reset')),
  setDeviceDescription: (name) => dispatch(deviceSettingsActions.setDescription(name)),
});

const mapStateToProps = (state) => ({
  deviceDescription: state.deviceSettings.description,
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  pairingHandlers,
)(Pairing);
