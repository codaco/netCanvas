import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { motion } from 'framer-motion';
import { Button } from '@codaco/ui';
import { Toggle, Number } from '@codaco/ui/lib/components/Fields';
import { actionCreators as deviceSettingsActions } from '../../../ducks/modules/deviceSettings';

const ExportOptions = (props) => {
  const {
    exportGraphML,
    exportCSV,
    unifyNetworks,
    useScreenLayoutCoordinates,
    screenLayoutHeight,
    screenLayoutWidth,
    toggleSetting,
    updateSetting,
  } = props;

  const updateLayoutSetting = (setting) => (value) => (
    updateSetting(setting, parseInt(value, 10) || 1)
  );

  return (
    <>
      <motion.article className="settings-element">
        <Toggle
          input={{
            value: exportGraphML,
            onChange: () => {
              // When turing off, if the other format is off, enable it
              if (exportGraphML && !exportCSV) {
                toggleSetting('exportCSV');
              }
              toggleSetting('exportGraphML');
            },
          }}
        />
        <div>
          <h2>Export GraphML Files</h2>
          <p>
            GraphML is the main file format used by the Network Canvas software. GraphML files
            can be used to manually import your data into Server, and can be opened by many
            other pieces of network analysis software.
          </p>
        </div>
      </motion.article>
      <motion.article className="settings-element">
        <Toggle
          input={{
            value: exportCSV,
            onChange: () => {
              // When turing off, if the other format is off, enable it
              if (exportCSV && !exportGraphML) {
                toggleSetting('exportGraphML');
              }
              toggleSetting('exportCSV');
            },
          }}
        />
        <div>
          <h2>Export CSV Files</h2>
          <p>
            CSV is a widely used format for storing network data, but this wider compatibility
            comes at the expense of robustness. If you enable this format, your networks will
            be exported as an
            {' '}
            <strong>attribute list file</strong>
            {' '}
            for each node type,
            an
            {' '}
            <strong>edge list file</strong>
            {' '}
            for each edge type, and an
            {' '}
            <strong>
              ego attribute
              file
            </strong>
            {' '}
            that also contains session data.
          </p>
        </div>
      </motion.article>
      <motion.article className="settings-element">
        <Toggle
          input={{
            value: unifyNetworks,
            onChange: () => toggleSetting('unifyNetworks'),
          }}
        />
        <div>
          <h2>Merge Sessions</h2>
          <p>
            If you enable this option, exporting multiple sessions at the same time will cause
            them to be merged into a single file, on a per-protocol basis. In the case of CSV
            export, you will receive one of each type of file for each protocol. In the case
            of GraphML you will receive a single GraphML file with
            multiple
            {' '}
            <code>&lt;graph&gt;</code>
            {' '}
            elements. Please note that with the exception of Network Canvas Server, most
            software does not yet support multiple graphs in a single GraphML file.
          </p>
        </div>
      </motion.article>
      <motion.article className="settings-element">
        <Toggle
          input={{
            value: useScreenLayoutCoordinates,
            onChange: () => toggleSetting('useScreenLayoutCoordinates'),
          }}
        />
        <div>
          <h2>Use Screen Layout Coordinates</h2>
          <p>
            By default Interviewer exports sociogram node coordinates as normalized X/Y
            values (a number between 0 and 1 for each axis, with the origin in the top
            left). Enabling this option will store coordinates as screen space pixel values,
            with the same origin.
          </p>
          { useScreenLayoutCoordinates && (
            <motion.article className="settings-element--sub-item">
              <div>
                <h3>Screen Size</h3>
                <p>
                  When computing screen layout coordinates, the following screen size (in
                  pixels) will be used.
                </p>
              </div>
              <Number
                label="Width (pixels, 1 pixel minimum)"
                input={{
                  value: screenLayoutWidth,
                  onChange: updateLayoutSetting('screenLayoutWidth'),
                  validation: {
                    required: true,
                    minValue: 1,
                  },
                }}
                name="screenLayoutWidth"
              />
              <Number
                label="Height (pixels, 1 pixel minimum)"
                input={{
                  value: screenLayoutHeight,
                  onChange: updateLayoutSetting('screenLayoutHeight'),
                  validation: {
                    required: true,
                    minValue: 1,
                  },
                }}
                name="screenLayoutHeight"
              />
              <Button
                size="small"
                disabled={
                  screenLayoutHeight === window.screen.height
                  && screenLayoutWidth === window.screen.width
                }
                onClick={() => {
                  updateSetting('screenLayoutHeight', window.screen.height);
                  updateSetting('screenLayoutWidth', window.screen.width);
                }}
              >
                Reset to device fullscreen resolution
              </Button>
            </motion.article>
          )}
        </div>
      </motion.article>
    </>
  );
};

const mapDispatchToProps = {
  toggleSetting: deviceSettingsActions.toggleSetting,
  updateSetting: deviceSettingsActions.setSetting,
};

const mapStateToProps = (state) => ({
  exportGraphML: state.deviceSettings.exportGraphML,
  exportCSV: state.deviceSettings.exportCSV,
  unifyNetworks: state.deviceSettings.unifyNetworks,
  useScreenLayoutCoordinates: state.deviceSettings.useScreenLayoutCoordinates,
  screenLayoutWidth: state.deviceSettings.screenLayoutWidth,
  screenLayoutHeight: state.deviceSettings.screenLayoutHeight,
});

ExportOptions.propTypes = {
  exportGraphML: PropTypes.bool.isRequired,
  exportCSV: PropTypes.bool.isRequired,
  unifyNetworks: PropTypes.bool.isRequired,
  useScreenLayoutCoordinates: PropTypes.bool.isRequired,
  screenLayoutWidth: PropTypes.number.isRequired,
  screenLayoutHeight: PropTypes.number.isRequired,
  toggleSetting: PropTypes.func.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(ExportOptions);
