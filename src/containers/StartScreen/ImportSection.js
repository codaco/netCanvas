import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GraphicButton, Button } from '@codaco/ui';
import Section from './Section';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import ProtocolUrlForm from './ProtocolUrlForm';
import { beginLocalProtocolImport } from '../../utils/protocol/importProtocol';
import useOnlineStatus from '../../hooks/useOnlineStatus';
import useServerConnectionStatus from '../../hooks/useServerConnectionStatus';
import ManageProtocolsOverlay from './ManageProtocolsOverlay';
import urlIcon from '../../images/undraw_in_thought.svg';
import localIcon from '../../images/undraw_selecting.svg';
import serverIcon from '../../images/undraw_file_sync.svg';
import FetchServerProtocolPicker from './FetchServerProtocolPicker';

const ImportSection = () => {
  const onlineStatus = useOnlineStatus();
  const pairedServer = useSelector((state) => state.pairedServer);
  const pairedServerConnection = useServerConnectionStatus(pairedServer);
  const installedProtocols = useSelector((state) => state.installedProtocols);
  const showProtocolUrlForm = useSelector((state) => state.ui.showProtocolUrlForm);
  const showFetchProtocolPicker = useSelector((state) => state.ui.showFetchProtocolPicker);
  const [showManageProtocolsOverlay, setShowManageProtocolsOverlay] = useState(false);

  const dispatch = useDispatch();
  const toggleShowProtocolUrlForm = () => dispatch(uiActions.toggle('showProtocolUrlForm'));
  const toggleShowFetchProtocolPicker = () => dispatch(uiActions.toggle('showFetchProtocolPicker'));

  return (
    <Section className="start-screen-section import-section">
      <main className="import-section__install-section">
        <header>
          <h2>Import Protocols</h2>
        </header>
        <div className="content-buttons">
          {
            onlineStatus && (
              <GraphicButton
                color="sea-green"
                onClick={toggleShowProtocolUrlForm}
                graphicSize="13rem"
                graphicPosition="100% 0%"
                graphic={urlIcon}
              >
                <h3>Import</h3>
                <h2>From URL</h2>
              </GraphicButton>
            )
          }
          <GraphicButton
            color="slate-blue--dark"
            onClick={beginLocalProtocolImport}
            graphicPosition="0% 0%"
            graphicSize="15rem"
            graphic={localIcon}
          >
            <h3>Import</h3>
            <h2>From File</h2>
          </GraphicButton>
          {
            onlineStatus && pairedServerConnection === 'ok' && (
              <GraphicButton
                color="mustard"
                onClick={toggleShowFetchProtocolPicker}
                graphicPosition="4rem 0rem"
                graphicSize="14rem"
                graphic={serverIcon}
              >
                <h3>Import</h3>
                <h2>From Server</h2>
              </GraphicButton>
            )
          }
        </div>
      </main>
      { Object.keys(installedProtocols).length > 0 && (
        <footer className="import-section__manage-protocols">
          <Button color="platinum" onClick={() => setShowManageProtocolsOverlay(true)}>Manage Installed Protocols...</Button>
        </footer>
      )}
      <ProtocolUrlForm show={showProtocolUrlForm} handleClose={toggleShowProtocolUrlForm} />
      <ManageProtocolsOverlay
        show={showManageProtocolsOverlay}
        onClose={() => setShowManageProtocolsOverlay(false)}
      />
      <FetchServerProtocolPicker
        show={showFetchProtocolPicker}
        onClose={() => toggleShowFetchProtocolPicker()}
      />
    </Section>
  );
};

ImportSection.propTypes = {
};

ImportSection.defaultProps = {
  pairedServer: null,
};

export default ImportSection;
