import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon } from 'network-canvas-ui';

import withPrompt from '../../behaviours/withPrompt';
import Search from '../../containers/Search';
import { actionCreators as networkActions } from '../../ducks/modules/network';
import { actionCreators as searchActions } from '../../ducks/modules/search';
import { makeNetworkNodesForPrompt } from '../../selectors/interface';
import { makeGetNodeType, makeGetPromptNodeAttributes } from '../../selectors/name-generator';
import { PromptSwiper } from '../';
import { NodeList } from '../../components/';

const networkNodesForPrompt = makeNetworkNodesForPrompt();
const getPromptNodeAttributes = makeGetPromptNodeAttributes();
const getNodeType = makeGetNodeType();

/**
  * NameGeneratorAutoComplete Interface
  * @extends Component
  */
class NameGeneratorAutoComplete extends Component {
  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onSearchComplete(selectedResults) {
    this.props.addNodeBatch(selectedResults, this.props.newNodeAttributes);
    this.props.closeSearch();
  }

  onKeyDown = (evt) => {
    if (this.props.searchIsOpen && (evt.key === 'Escape' || evt.keyCode === 27)) {
      this.props.closeSearch();
    }
  }

  render() {
    const {
      closeSearch,
      nodesForPrompt,
      nodeType,
      prompt,
      promptForward,
      promptBackward,
      searchIsOpen,
      stage,
      toggleSearch,
    } = this.props;

    const searchBtnClasses = cx(
      'name-generator-auto-complete-interface__search-button',
      {
        'name-generator-auto-complete-interface__search-button--hidden': searchIsOpen,
      },
    );

    return (
      <div className="name-generator-auto-complete-interface">
        <div className="name-generator-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={stage.prompts}
          />
        </div>

        <div className="name-generator-auto-complete-interface__nodes">
          <NodeList
            id="AUTOCOMPLETE_NODE_LIST"
            nodes={nodesForPrompt}
            label={node => node[prompt.displayLabel]}
          />
        </div>

        { /* TODO: need a more generic icon, or customizability */ }
        <Icon
          name="add-a-person"
          onClick={toggleSearch}
          className={searchBtnClasses}
        />

        <Search
          dataSourceKey={prompt.dataSource}
          displayFields={[prompt.displayLabel, ...prompt.displayProperties]}
          excludedNodes={nodesForPrompt}
          nodeType={nodeType}
          onClick={closeSearch}
          onComplete={selectedResults => this.onSearchComplete(selectedResults)}
          options={prompt.autoCompleteOptions}
        />

      </div>
    );
  }
}

NameGeneratorAutoComplete.propTypes = {
  addNodeBatch: PropTypes.func.isRequired,
  closeSearch: PropTypes.func.isRequired,
  newNodeAttributes: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeType: PropTypes.string.isRequired,
  toggleSearch: PropTypes.func.isRequired,
  prompt: PropTypes.object.isRequired,
  promptForward: PropTypes.func.isRequired,
  promptBackward: PropTypes.func.isRequired,
  searchIsOpen: PropTypes.bool.isRequired,
  stage: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    addNodeBatch: bindActionCreators(networkActions.addNodeBatch, dispatch),
    closeSearch: bindActionCreators(searchActions.closeSearch, dispatch),
    toggleSearch: bindActionCreators(searchActions.toggleSearch, dispatch),
  };
}

function makeMapStateToProps() {
  return function mapStateToProps(state, props) {
    return {
      newNodeAttributes: getPromptNodeAttributes(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeType: getNodeType(state, props),
      searchIsOpen: !state.search.collapsed,
    };
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGeneratorAutoComplete);
