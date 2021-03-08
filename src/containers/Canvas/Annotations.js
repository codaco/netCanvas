import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Fade } from '@codaco/ui/lib/components/Transitions';
import DragManager, { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';

const AnnotationLines = ({
  lines, isDrawing, isFreeze, linesShowing, linesToFade, onLineFaded,
}) => (
  <svg className="annotations__lines" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">
    {lines.map((line, index) => {
      const handleLineGone = () => onLineFaded(index);
      return (
        <AnnotationLine
          key={index}
          line={line}
          showLine={(isDrawing && index === lines.length - 1) || !!linesToFade[index]}
          freezeLine={isFreeze && !!linesShowing[index]}
          onLineFaded={handleLineGone}
        />
      );
    })}
  </svg>
);

AnnotationLines.propTypes = {
  isDrawing: PropTypes.bool.isRequired,
  isFreeze: PropTypes.bool.isRequired,
  lines: PropTypes.array.isRequired,
  linesShowing: PropTypes.array.isRequired,
  linesToFade: PropTypes.array.isRequired,
  onLineFaded: PropTypes.func.isRequired,
};

const AnnotationLine = ({
  line, showLine, freezeLine, onLineFaded,
}) => {
  const pathData = `M ${line.map((point) => (`${point.x} ${point.y}`)).join(' L ')}`;
  let path = (
    <Fade
      in={showLine}
      enter={false}
      customDuration={{ enter: 0, exit: 3000 * Math.log10(line.length ** 2) }}
      onExited={onLineFaded}
    >
      <path className="annotations__path" d={pathData} vectorEffect="non-scaling-stroke" />
    </Fade>
  );
  if (freezeLine) {
    path = <path className="annotations__path" d={pathData} vectorEffect="non-scaling-stroke" />;
  }

  return (
    path
  );
};

AnnotationLine.propTypes = {
  freezeLine: PropTypes.bool.isRequired,
  line: PropTypes.array.isRequired,
  onLineFaded: PropTypes.func.isRequired,
  showLine: PropTypes.bool.isRequired,
};

class Annotations extends Component {
  constructor() {
    super();

    this.state = {
      lines: [],
      linesShowing: [],
      linesToFade: [],
      activeLines: 0,
      isDrawing: false,
    };

    this.dragManager = null;
    this.portal = document.createElement('div');
    this.portal.className = 'annotations';
    this.removeLineTimers = [];
  }

  componentDidMount() {
    const nodeListRoot = document.getElementsByClassName('node-layout').length > 0
      ? document.getElementsByClassName('node-layout')[0]
      : document.getElementById('narrative-interface__canvas');
    if (nodeListRoot) {
      nodeListRoot.insertBefore(this.portal, nodeListRoot.firstChild);
    }

    this.dragManager = new DragManager({
      el: this.portal,
      onDragStart: this.onDragStart,
      onDragMove: this.onDragMove,
      onDragEnd: this.onDragEnd,
      scrollDirection: NO_SCROLL,
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isFreeze !== this.props.isFreeze) {
      if (this.props.isFreeze) {
        this.freeze();
      } else {
        this.unfreeze();
      }
    }
  }

  componentWillUnmount() {
    this.cleanupDragManager();
    this.resetRemoveLineTimers();

    if (this.portal) {
      this.portal.remove();
    }
  }

  onDragStart = (mouseEvent) => {
    const point = this.relativeCoordinatesForEvent(mouseEvent);
    const lines = this.state.lines.slice();
    const linesShowing = this.state.linesShowing.slice();
    lines.push([point]);
    linesShowing.push(true);

    this.setState({
      lines,
      linesShowing,
      activeLines: this.state.activeLines + 1,
      isDrawing: true,
    });

    this.props.setActiveStatus(true);
  };

  onDragMove = (mouseEvent) => {
    if (!this.state.isDrawing) {
      return;
    }

    const point = this.relativeCoordinatesForEvent(mouseEvent);
    const lines = this.state.lines.slice();
    lines[lines.length - 1].push(point);

    this.setState({
      lines,
    });
  };

  onDragEnd = () => {
    this.setState({ isDrawing: false });
    if (this.props.isFreeze) return;

    // Add a setTimeout that will trigger line starting to fade.
    this.removeLineTimers.push(
      setTimeout(
        this.fadeLines.bind(null, this.state.lines.length - 1),
        1000,
      ),
    );
  };

  fadeLines = (position) => {
    const linesToFade = this.state.linesToFade.slice();
    linesToFade[position] = false;

    this.setState({
      linesToFade,
    });
  }

  // callback from line Fade, reduces activeLines count as lines disappear
  handleLineGone = (position) => {
    const linesShowing = this.state.linesShowing.slice();
    linesShowing[position] = false;

    this.setState({
      activeLines: this.state.activeLines - 1,
      linesShowing,
    }, () => {
      if (this.state.activeLines === 0) {
        this.props.setActiveStatus(false);
      }
    });
  }

  freeze = () => {
    this.resetRemoveLineTimers();
  }

  unfreeze = () => {
    const linesToFade = this.state.linesShowing.slice();
    this.setState({
      linesToFade,
    });

    this.state.linesShowing.forEach((showing, index) => {
      if (showing) {
        this.removeLineTimers.push(
          setTimeout(
            this.fadeLines.bind(null, index),
            1000,
          ),
        );
      }
    });
  }

  // Called by parent component via ref when the reset button is clicked.
  reset = () => {
    this.setState({
      lines: [],
      activeLines: 0,
      linesToFade: [],
      linesShowing: [],
      isDrawing: false,
    });

    this.resetRemoveLineTimers();
    this.props.setActiveStatus(false);
  };

  resetRemoveLineTimers = () => {
    if (this.removeLineTimers) {
      this.removeLineTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      this.removeLineTimers = [];
    }
  }

  cleanupDragManager = () => {
    if (this.dragManager) {
      this.dragManager.unmount();
      this.dragManager = null;
    }
  };

  relativeCoordinatesForEvent(mouseEvent) {
    const boundingRect = this.portal.getBoundingClientRect();
    return ({
      x: (mouseEvent.x - boundingRect.left) / boundingRect.width,
      y: (mouseEvent.y - boundingRect.top) / boundingRect.height,
    });
  }

  render() {
    return ReactDOM.createPortal(
      (
        <AnnotationLines
          lines={this.state.lines}
          isFreeze={this.props.isFreeze}
          linesShowing={this.state.linesShowing}
          linesToFade={this.state.linesToFade}
          isDrawing={this.state.isDrawing}
          onLineFaded={this.handleLineGone}
        />
      ),
      this.portal,
    );
  }
}

Annotations.propTypes = {
  isFreeze: PropTypes.bool,
  setActiveStatus: PropTypes.func,
};

Annotations.defaultProps = {
  isFreeze: false,
  setActiveStatus: () => { },
};

export default Annotations;
