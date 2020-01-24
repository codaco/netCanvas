/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { filter, includes } from 'lodash';
import { assert, createDeepEqualSelector } from './utils';
import { getProtocolCodebook } from './protocol';
import { getNetworkEdges, getNetworkNodes } from './network';
import { getAdditionalAttributes, getSubject } from '../utils/protocol/accessors';


// Selectors that are generic between interfaces

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// Prop selectors

const propStage = (_, props) => props.stage;
const propPrompt = (_, props) => props.prompt;
const propStageId = (_, props) => props.stage.id;
const propPromptId = (_, props) => props.prompt.id;

// Returns current stage and prompt ID
export const makeGetIds = () =>
  createSelector(
    propStageId, propPromptId,
    (stageId, promptId) => ({ stageId, promptId }),
  );

export const makeGetAdditionalAttributes = () =>
  createSelector(
    propStage, propPrompt,
    (stage, prompt) => getAdditionalAttributes(stage, prompt),
  );

export const makeGetSubject = () =>
  createSelector(
    propStage, propPrompt,
    (stage, prompt) => getSubject(stage, prompt),
  );

const nodeTypeIsDefined = (codebook, nodeType) => {
  if (!codebook) { return false; }
  return codebook.node[nodeType];
};

// TODO: Once schema validation is in place, we don't need these asserts.
export const makeGetSubjectType = () => (createSelector(
  (state, props) => getProtocolCodebook(state, props),
  makeGetSubject(),
  (codebook, subject) => {
    assert(subject, 'The "subject" property is not defined for this prompt');
    assert(nodeTypeIsDefined(codebook, subject.type), `Node type "${subject.type}" is not defined in the registry`);
    return subject && subject.type;
  },
));

export const makeGetNodeVariables = () => createDeepEqualSelector(
  (state, props) => getProtocolCodebook(state, props),
  makeGetSubjectType(),
  (codebook, nodeType) => {
    const nodeInfo = codebook.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].variables;
  },
);

// TODO: Not sure this needs to be a createSelector
export const makeGetPromptVariable = () =>
  createSelector(
    propPrompt,
    prompt => prompt.variable,
  );

export const getPromptOtherVariable = (state, props) => {
  const prompt = propPrompt(state, props);
  return [prompt.otherVariable, prompt.otherVariableLabel];
};

export const makeGetVariableOptions = (includeOtherVariable = false) =>
  createSelector(
    makeGetNodeVariables(), makeGetPromptVariable(), getPromptOtherVariable,
    (nodeVariables, promptVariable, [promptOtherVariable, promptOtherVariableLabel]) => {
      const optionValues = nodeVariables[promptVariable].options || [];
      const otherValue = { label: promptOtherVariableLabel, value: null, otherVariable: promptOtherVariable };

      return includeOtherVariable && promptOtherVariable ?
        [...optionValues, otherValue] :
        optionValues;
    },
  );

/**
 * makeNetworkEdgesForType()
 * Get the current prompt/stage subject, and filter the network by this edge type.
*/

export const makeNetworkEdgesForType = () =>
  createSelector(
    (state, props) => getNetworkEdges(state, props),
    makeGetSubject(),
    (edges, subject) => filter(edges, ['type', subject.type]),
  );

/**
 * makeNetworkNodesForType()
 * Get the current prompt/stage subject, and filter the network by this node type.
*/

export const makeNetworkNodesForType = () =>
  createSelector(
    (state, props) => getNetworkNodes(state, props),
    makeGetSubject(),
    (nodes, subject) => filter(nodes, ['type', subject.type]),
  );

/**
 * makeNetworkNodesForPrompt
 *
 * Return a filtered node list containing only nodes where node IDs contains the current promptId.
*/

export const makeNetworkNodesForPrompt = () => {
  const getNetworkNodesForSubject = makeNetworkNodesForType();
  return createSelector(
    getNetworkNodesForSubject, propPromptId,
    (nodes, promptId) => filter(nodes, node => includes(node.promptIDs, promptId)),
  );
};

/**
 * makeNetworkNodesForOtherPrompts()
 *
 * Same as above, except returns a filtered node list that **excludes** nodes that match the current
 * prompt's promptId.
*/

export const makeNetworkNodesForOtherPrompts = () => {
  const getNetworkNodesForSubject = makeNetworkNodesForType();

  return createSelector(
    getNetworkNodesForSubject, propPromptId,
    (nodes, promptId) => filter(nodes, node => !includes(node.promptIDs, promptId)),
  );
};
