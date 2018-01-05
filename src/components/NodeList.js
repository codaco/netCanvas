import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, map, isEqual } from 'lodash';
import cx from 'classnames';
import { Node, animation } from 'network-canvas-ui';
import { TransitionGroup } from 'react-transition-group';
import { Node as NodeTransition } from './Transition';
import { scrollable, selectable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Node.
  */
class NodeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodes: props.nodes,
      refresh: 0,
      stagger: true,
    };

    this.refreshTimer = null;
  }

  componentWillReceiveProps(newProps) {
    // Don't update if nodes are the same
    if (isEqual(map(newProps.nodes, 'uid'), map(this.state.nodes, 'uid'))) {
      return;
    }

    // if we are on the same prompt/provided same id, then just append the node
    if (newProps.id === this.props.id) {
      this.setState({ nodes: newProps.nodes, stagger: false });
      return;
    }

    // Otherwise, transition out and in again
    this.props.scrollTop(0);

    this.setState(
      { nodes: [] },
      () => {
        if (this.refreshTimer) { clearTimeout(this.refreshTimer); }
        this.refreshTimer = setTimeout(
          () => this.setState({
            nodes: newProps.nodes,
            stagger: true,
          }),
          animation.duration.slow,
        );
      },
    );
  }

  render() {
    const {
      nodeColor,
      label,
      selected,
      onSelect,
      itemType,
      isOver,
      willAccept,
      meta,
    } = this.props;

    const {
      stagger,
      nodes,
    } = this.state;

    const isSource = !!find(nodes, ['uid', get(meta, 'uid', null)]);

    const classNames = cx(
      'node-list',
      { 'node-list--hover': !isSource && willAccept && isOver },
      { 'node-list--drag': !isSource && willAccept }, // TODO: rename class
    );

    return (
      <TransitionGroup
        className={classNames}
      >
        {
          nodes.map((node, index) => (
            <NodeTransition
              key={`${node.uid}`}
              index={index}
              stagger={stagger}
            >
              <EnhancedNode
                color={nodeColor}
                label={`${label(node)}_${index}`}
                selected={selected(node)}
                onSelected={() => onSelect(node)}
                meta={() => ({ ...node, itemType })}
                {...node}
              />
            </NodeTransition>
          ))
        }
      </TransitionGroup>
    );
  }
}

NodeList.propTypes = {
  nodes: PropTypes.array.isRequired,
  nodeColor: PropTypes.string,
  onSelect: PropTypes.func,
  itemType: PropTypes.string,
  label: PropTypes.func,
  selected: PropTypes.func,
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
  meta: PropTypes.object,
  id: PropTypes.string.isRequired,
  scrollTop: PropTypes.func,
};

NodeList.defaultProps = {
  nodes: [],
  nodeColor: '',
  label: () => (''),
  selected: () => false,
  onSelect: () => {},
  onDrop: () => {},
  itemType: 'NODE',
  isOver: false,
  willAccept: false,
  isDragging: false,
  meta: {},
  scrollTop: () => {},
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
  scrollable,
)(NodeList);
