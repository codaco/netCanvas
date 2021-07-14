import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GraphicButton } from '@codaco/ui';
import Section from './Section';
import SessionManagementScreen from '../SessionManagementScreen/SessionManagementScreen';
import exportIcon from '../../images/undraw_export_files.svg';

const SessionManagementSection = () => {
  const [showSessionManagement, setShowSessionManagement] = useState(false);

  const closeSessionManagement = () => setShowSessionManagement(false);

  const sessions = useSelector((state) => state.sessions);

  if (Object.keys(sessions).length === 0) { return null; }

  return (
    <>
      <Section className="start-screen-section session-management-section">
        <main className="session-management-section__main">
          <header>
            <h2>Manage and Export Session Data</h2>
          </header>
          <div className="content-buttons">
            <GraphicButton
              color="sea-serpent"
              onClick={() => setShowSessionManagement(true)}
              graphicSize="10.5rem"
              graphicPosition="5% 0%"
              graphic={exportIcon}
            >
              <h3>Manage or Export</h3>
              <h2>Sessions</h2>
            </GraphicButton>
          </div>
        </main>
      </Section>
      <SessionManagementScreen
        show={!!showSessionManagement}
        onClose={closeSessionManagement}
      />
    </>
  );
};

export default SessionManagementSection;
