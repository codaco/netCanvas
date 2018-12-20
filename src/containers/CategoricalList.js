import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Flipper } from 'react-flip-toolkit';
import cx from 'classnames';
import { makeNetworkNodesForType, makeGetVariableOptions, makeGetPromptVariable, makeGetNodeDisplayVariable } from '../selectors/interface';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { CategoricalItem } from '../components/';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import { getCSSVariableAsString } from '../ui/utils/CSSVariables';
import { getNodeAttributes, nodeAttributesProperty, nodePrimaryKeyProperty } from '../ducks/modules/network';
import getAbsoluteBoundingRect from '../utils/getAbsoluteBoundingRect';

const getIsPortrait = bounds =>
  bounds.width / bounds.height < 1;

const getExpandedSize = bounds => (
  bounds.height > (bounds.width * 0.67) ?
    Math.floor(bounds.width * 0.67) :
    bounds.height
);

const getExpandedSizeVariables = bounds => ([
  ['--categorical-list-expanded-bin-size', `${getExpandedSize(bounds)}px`],
]);

const getItemSizeVariables = (bounds, itemCount) => {
  const isPortrait = getIsPortrait(bounds);

  const shortCount = [4, 5, 6, 7, 8].includes(itemCount) ? 2 : 1;
  const longCount = shortCount > 1 ? Math.ceil(itemCount / 2) : itemCount;

  const expandedSize = getExpandedSize(bounds);

  const width = bounds.width - expandedSize;

  const longSide = isPortrait ? bounds.height : width;
  const shortSide = isPortrait ? width : bounds.height;

  const x = Math.floor(longSide / longCount);
  const y = Math.floor(shortSide / shortCount);
  const z = x < y ? x : y;

  return [
    ['--categorical-item-size', `${z}px`],
    ['--categorical-list-rows', `${isPortrait ? longCount : shortCount}`],
    ['--categorical-list-columns', `${isPortrait ? shortCount : longCount}`],
  ];
}

/**
  * CategoricalList: Renders a list of categorical bin items
  */
class CategoricalList extends Component {
  constructor(props) {
    super(props);
    this.categoricalListElement = React.createRef();
    this.state = {
      expandedBinValue: '',
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentDidUpdate() {
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = debounce(() => {
    this.updateStyles();
  }, 1000 / 60);

  getDetails = (nodes) => {
    if (nodes.length === 0) {
      return '';
    }

    // todo: the following should be updated to reflect the sort order of the bins
    const name = nodes[0][nodeAttributesProperty] && this.props.displayVariable &&
      nodes[0][nodeAttributesProperty][this.props.displayVariable];

    if (nodes.length > 0) {
      return `${name}${nodes.length > 1 ? ` and ${nodes.length - 1} other${nodes.length > 2 ? 's' : ''}` : ''}`;
    }

    return '';
  };

  getSizeVariables = () => {
    if (!this.categoricalListElement.current) {
      return [];
    }

    const categoricalListElement = this.categoricalListElement.current;

    const bounds = getAbsoluteBoundingRect(categoricalListElement);

    const expandedSize = getExpandedSizeVariables(bounds);
    const itemSize = getItemSizeVariables(bounds, this.props.bins.length);

    return [...expandedSize, ...itemSize];
  };

  updateStyles = () => {
    if (!this.categoricalListElement.current) {
      return;
    }

    const categoricalListElement = this.categoricalListElement.current;

    const styles = this.getSizeVariables();

    categoricalListElement.style = styles
      .map(([property, value]) => `${property}: ${value};`)
      .join(' ');

    categoricalListElement.classList.add('categorical-list__items--sized');
  }

  expandBin = (e, binValue) => {
    if (e) e.stopPropagation();
    this.setState({
      expandedBinValue: binValue,
    });
  }

  renderCategoricalBin = (bin, index) => {
    const onDrop = ({ meta }) => {
      if (getNodeAttributes(meta)[this.props.activePromptVariable] === [bin.value]) {
        return;
      }

      this.props.toggleNodeAttributes(meta[nodePrimaryKeyProperty],
        { [this.props.activePromptVariable]: [bin.value] });
    };

    const binDetails = this.getDetails(bin.nodes);

    const colorPresets = [
      getCSSVariableAsString('--cat-color-seq-1'),
      getCSSVariableAsString('--cat-color-seq-2'),
      getCSSVariableAsString('--cat-color-seq-3'),
      getCSSVariableAsString('--cat-color-seq-4'),
      getCSSVariableAsString('--cat-color-seq-5'),
      getCSSVariableAsString('--cat-color-seq-6'),
      getCSSVariableAsString('--cat-color-seq-7'),
      getCSSVariableAsString('--cat-color-seq-8'),
      getCSSVariableAsString('--cat-color-seq-9'),
      getCSSVariableAsString('--cat-color-seq-10'),
    ];

    const getCatColor = (itemNumber) => {
      if (itemNumber >= 0) { return colorPresets[itemNumber % colorPresets.length]; }
      return null;
    };

    return (
      <div className="categorical-list__item">
        <CategoricalItem
          id={`CATBIN_ITEM_${this.props.stage.id}_${this.props.prompt.id}_${bin.value}`}
          key={bin.value}
          label={bin.label}
          accentColor={getCatColor(index)}
          onDrop={item => onDrop(item)}
          onClick={e => this.expandBin(e, bin.value)}
          details={binDetails}
          isExpanded={this.state.expandedBinValue === bin.value}
          nodes={bin.nodes}
          sortOrder={this.props.prompt.binSortOrder}
        />
      </div>
    );
  }

  render() {
    const listClasses = cx(
      'categorical-list',
      { 'categorical-list--expanded': this.state.expandedBinValue },
    );

    const listItemsClasses = cx(
      'categorical-list__items',
      `categorical-list__items--${this.props.bins.length}`,
    );

    // Render before filter, because we need to preserve order for colors.
    const categoricalBins = this.props.bins
      .map(this.renderCategoricalBin)
      .filter((bin, index) =>
        this.props.bins[index].value !== this.state.expandedBinValue,
      );

    // Render before filter, because we need to preserve order for colors.
    const expandedBin = this.props.bins
      .map(this.renderCategoricalBin)
      .filter((bin, index) =>
        this.props.bins[index].value === this.state.expandedBinValue,
      );

    return (
      <Flipper
        flipKey={this.state.expandedBinValue}
        className={listClasses}
      >
        <div
          className={listItemsClasses}
          ref={this.categoricalListElement}
        >
          <div className="categorical-list__expanded-bin">
            {expandedBin}
          </div>
          {categoricalBins}

        </div>
      </Flipper>
    );
  }
}

CategoricalList.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  bins: PropTypes.array.isRequired,
  displayVariable: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  toggleNodeAttributes: PropTypes.func.isRequired,
};

CategoricalList.defaultProps = {
  isDragging: false,
  meta: {},
};

function makeMapStateToProps() {
  const getCategoricalValues = makeGetVariableOptions();
  const getPromptVariable = makeGetPromptVariable();
  const getStageNodes = makeNetworkNodesForType();
  const getNodeDisplayVariable = makeGetNodeDisplayVariable();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);

    return {
      activePromptVariable,
      bins: getCategoricalValues(state, props)
        .map((bin) => {
          const nodes = stageNodes.filter(
            node =>
              node[nodeAttributesProperty][activePromptVariable] &&
              node[nodeAttributesProperty][activePromptVariable].includes(bin.value),
          );

          return {
            ...bin,
            nodes,
          };
        }),
      displayVariable: getNodeDisplayVariable(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleNodeAttributes: bindActionCreators(sessionsActions.toggleNodeAttributes, dispatch),
  };
}

export { CategoricalList as UnconnectedCategoricalList };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(CategoricalList);
