import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { first } from 'lodash';
import PropTypes from 'prop-types';
import withPrompt from '../../behaviours/withPrompt';
import { PromptSwiper, OrdinalBins, NodeBucket } from '../Elements';

// Render method for the node labels

/**
  * OrdinalBin Interface
  * @extends Component
  */
const OrdinalBin = ({
  promptForward,
  promptBackward,
  prompt,
  stage,
}) => {
  const onDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    this.props.updateNode({ ...node, [this.props.layout]: relativeCoords });
  };

  return (
    <div className="ordinal-bin-interface">
      <div className="ordinal-bin-interface__prompt">
        <PromptSwiper
          forward={promptForward}
          backward={promptBackward}
          prompts={stage.params.prompts}
          prompt={prompt}
        />
      </div>
      <div className="ordinal-bin-interface__nodes">
        <NodeBucket
          stage={stage}
          prompt={prompt}
          onDropNode={onDropNode}
        />
      </div>
      <div className="ordinal-bin-interface__ordinalbin">
        <OrdinalBins
          stage={stage}
          prompt={prompt}
          key={prompt.id}
        />
      </div>
    </div>
  );
};

OrdinalBin.propTypes = {
  stage: PropTypes.object.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
  const newNodeAttributes = {
    type: props.stage.params.nodeType,
    stageId: props.stage.id,
    promptId: props.prompt.id,
    ...props.prompt.nodeAttributes,
  };

  return {
    newNodeAttributes,
  };
}

export default compose(
  withPrompt,
  connect(mapStateToProps),
)(OrdinalBin);
