import React from 'react';
import { motion } from 'framer-motion';

const Section = (props) => {
  const {
    children,
    className,
    ...rest
  } = props;

  const springy = {
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
      },
    },
    hide: {
      opacity: 0,
      y: '10rem',
    },
  };

  return (
    <motion.section
      className={className}
      variants={springy}
      {...rest}
    >
      {children}
    </motion.section>
  );
};

Section.propTypes = {
};

Section.defaultProps = {
};

export default Section;
