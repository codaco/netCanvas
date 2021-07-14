import React from 'react';
import { motion } from 'framer-motion';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import HeaderSection from './HeaderSection';
import InterviewSection from './InterviewSection';
import ImportSection from './ImportSection';
import ServerSection from './ServerSection';
import WhatsNewSection from './WhatsNewSection';
import SessionManagementSection from './SessionManagementSection';

const StartScreen = ({
  activeSessionId,
  sessions,
}) => {
  const variants = {
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.32, when: 'beforeChildren' },
    },
    hide: {
      opacity: 0,
    },
  };

  if (activeSessionId) {
    const { stageIndex } = sessions[activeSessionId];
    const pathname = `/session/${activeSessionId}/${stageIndex}`;
    return (<Redirect to={{ pathname: `${pathname}` }} />);
  }

  return (
    <div className="start-screen">
      <motion.div
        className="start-screen__container"
        variants={variants}
        animate="show"
        initial="hide"
        key="start-screen"
      >
        <HeaderSection />
        <WhatsNewSection />
        <InterviewSection />
        <SessionManagementSection />
        <ImportSection />
        <ServerSection />
      </motion.div>
    </div>
  );
};

StartScreen.defaultProps = {
};

StartScreen.propTypes = {

};

const mapDispatchToProps = {

};

const mapStateToProps = (state) => ({
  activeSessionId: state.activeSessionId,
  sessions: state.sessions,

});

export default connect(mapStateToProps, mapDispatchToProps)(StartScreen);
