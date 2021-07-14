import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@codaco/ui';
import Section from './Section';
import NCLogo from '../../images/NC-Flat@4x.png';
import networkCanvasLogo from '../../images/NC-Mark.svg';
import { actionCreators as deviceSettingsActions } from '../../ducks/modules/deviceSettings';
import { importProtocolFromURI } from '../../utils/protocol/importProtocol';
import { SettingsMenuButton } from '../../components/SettingsMenu';
import { openExternalLink } from '../../components/ExternalLink';
import { Switch } from '../../components';
import getVersion from '../../utils/getVersion';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const HeaderSection = () => {
  const onlineStatus = useOnlineStatus();

  const [appVersion, setAppVersion] = useState('0.0.0');
  const showGettingStarted = useSelector((state) => state.deviceSettings.showGettingStarted);
  const dispatch = useDispatch();
  const toggleShowGettingStarted = () => dispatch(deviceSettingsActions.toggleSetting('showGettingStarted'));

  useEffect(() => {
    getVersion().then((version) => setAppVersion(version));
  }, [onlineStatus]);

  const gettingStartedStates = {
    show: {
      height: 'auto',
    },
    hide: {
      height: '0px',
    },
  };

  return (
    <Section className="start-screen-section start-screen-header">
      <header className="start-screen-header__top">
        <SettingsMenuButton />
        <Switch
          className="header-toggle"
          label="Show welcome"
          on={showGettingStarted}
          onChange={() => toggleShowGettingStarted()}
        />
      </header>
      <div className="start-screen-header__wrapper">
        <div className="header-brand">
          <img src={NCLogo} className="header-logo" alt="Network Canvas Interviewer" />
        </div>
        <div className="header-mark">
          <div className="project-tag">
            <img src={networkCanvasLogo} alt="A Network Canvas project" style={{ height: '2.4rem', width: '2.4rem' }} />
            <h5>Network Canvas</h5>
          </div>
          <h1>Interviewer</h1>
          <h4>A tool for conducting Network Canvas Interviews.</h4>
        </div>
        <div className="version-string">{appVersion}</div>
      </div>
      <motion.section
        className="welcome-section"
      >
        <motion.div
          initial={gettingStartedStates.hide}
          animate={showGettingStarted ? gettingStartedStates.show : gettingStartedStates.hide}
        >
          <main className="welcome-section__main">
            <header>
              <h2>Welcome to Interviewer!</h2>
            </header>
            <div className="welcome-description">
              <p>
                If this is your first time using Network Canvas Interviewer, please consider taking
                a moment to watch our overview video. It will introduce you to the key
                concepts of the Network Canvas project.
              </p>
              <p>
                For further detailed information, tutorials, videos, and information about
                collaboration, please visit our documentation website.
              </p>
              <p>
                To get started right away, install one or more interview protocols
                onto this device. For convenience, we have created a sample interview
                protocol on the theme of &quot;public health&quot; research.
              </p>
            </div>
            <div className="welcome-actions">
              <Button
                color="primary"
                onClick={() => openExternalLink('https://www.youtube.com/watch?v=XzfE6j-LnII')}
                disabled={!onlineStatus}
              >
                Watch overview video
              </Button>
              <Button
                color="sea-serpent"
                onClick={() => openExternalLink('https://documentation.networkcanvas.com')}
                disabled={!onlineStatus}
              >
                Visit documentation website
              </Button>
              <Button
                color="mustard"
                disabled={!onlineStatus}
                onClick={() => importProtocolFromURI('https://documentation.networkcanvas.com/protocols/Sample%20Protocol%20v2.netcanvas')}
              >
                Install sample protocol
              </Button>
            </div>
          </main>
        </motion.div>
      </motion.section>
    </Section>
  );
};

HeaderSection.propTypes = {
};

HeaderSection.defaultProps = {
};

export default HeaderSection;

export { HeaderSection as UnconnectedHeaderSection };
