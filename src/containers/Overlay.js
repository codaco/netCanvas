import React, { useState } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import ExpandLessIcon from '@material-ui/icons/ExpandLessRounded';
import { Modal } from '@codaco/ui';
import CloseButton from '../components/CloseButton';

/**
 * Renders a modal window.
 */

const Overlay = (props) => {
  const {
    children,
    onClose,
    onBlur,
    show,
    title,
    footer,
    fullheight,
    fullscreen: startFullScreen,
    forceDisableFullScreen,
    className,
  } = props;

  const [fullscreen, setFullscreen] = useState(!!startFullScreen);

  const useFullScreenForms = useSelector((state) => state.deviceSettings.useFullScreenForms);

  if (!show) { return false; }

  const overlayClasses = cx(
    'overlay',
    // eslint-disable-next-line @codaco/spellcheck/spell-checker
    { 'overlay--fullheight': fullheight },
    { 'overlay--fullscreen': !forceDisableFullScreen && useFullScreenForms },
    { 'overlay--fullscreen': fullscreen },
    className,
  );

  const handleFullScreenChange = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <Modal show={show} onBlur={onBlur}>
      <motion.article className={overlayClasses}>
        { title && (
          <motion.header className="overlay__title">
            { !forceDisableFullScreen && (
            <motion.div
              style={{ cursor: 'pointer', display: 'flex' }}
              onClick={handleFullScreenChange}
              animate={!fullscreen ? { rotate: 0 } : { rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExpandLessIcon style={{ fontSize: '4rem' }} />
            </motion.div>
            )}
            <h1>{title}</h1>
            <CloseButton className="overlay__close" onClick={onClose} />
          </motion.header>
        )}
        <motion.main className="overlay__content">
          {children}
        </motion.main>
        { footer && (
          <motion.footer className="overlay__footer">
            {footer}
          </motion.footer>
        )}
      </motion.article>
    </Modal>
  );
};

Overlay.propTypes = {
  onClose: PropTypes.func,
  onBlur: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool,
  children: PropTypes.any,
  footer: PropTypes.any,
  fullheight: PropTypes.bool,
  forceDisableFullScreen: PropTypes.bool,
  className: PropTypes.string,
};

Overlay.defaultProps = {
  onBlur: () => {},
  onClose: () => {},
  title: null,
  className: '',
  show: false,
  children: null,
  footer: null,
  fullheight: false,
  forceDisableFullScreen: false,
};

export {
  Overlay,
};

export default Overlay;
