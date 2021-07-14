/* eslint-disable import/prefer-default-export */

import faker from 'faker';
import uuid from 'uuid/v4';
import { has, times, omit } from 'lodash';
import { actionCreators as sessionsActions } from './sessions';
import { entityPrimaryKeyProperty, entityAttributesProperty } from './network';

const MOCK_GENERATE_NODES = 'MOCK/GENERATE_NODES';

const mockCoord = () => faker.random.number({ min: 0, max: 1, precision: 0.000001 });

// Todo: make these mock values reflect validation
const mockValue = (variable) => {
  switch (variable.type) {
    case 'boolean':
      return faker.random.boolean();
    case 'number':
      return faker.random.number({ min: 20, max: 100 });
    case 'scalar':
      return faker.random.number({ min: 0, max: 1, precision: 0.001 });
    case 'datetime':
      return faker.date.recent().toISOString().slice(0, 10);
    case 'ordinal':
      return faker.random.arrayElement(variable.options).value;
    case 'categorical':
      return [faker.random.arrayElement(variable.options).value];
    case 'layout':
      return { x: mockCoord(), y: mockCoord() };
    case 'text': {
      if (variable.name.toLowerCase() === 'name' || variable.name.toLowerCase().includes('name')) {
        return faker.name.findName();
      }

      if (variable.component && variable.component === 'TextArea') {
        return faker.lorem.paragraph();
      }
      return faker.random.word();
    }
    default:
      return faker.random.word();
  }
};

const makeEntity = (typeID, variables = {}, promptAttributes = {}) => {
  const mockAttributes = Object.entries(variables).reduce(
    (acc, [variableId, variable]) => {
      if (!has(promptAttributes, variableId)) {
        acc[variableId] = mockValue(variable);
      }
      return acc;
    }, {},
  );

  const modelData = {
    [entityPrimaryKeyProperty]: uuid(),
    promptIDs: ['mock'],
    stageId: 'mock',
    ...(typeID && { type: typeID }),
  };

  return {
    ...modelData,
    [entityAttributesProperty]: {
      ...mockAttributes,
    },
  };
};

const makeNetwork = (protocol) => {
  const codebookNodeTypes = Object.keys(protocol.codebook.node || {});
  const codebookEdgeTypes = Object.keys(protocol.codebook.edge || {});

  // Generate nodes
  const nodes = [];
  const networkMaxNodes = 20;
  const networkMinNodes = 2;

  codebookNodeTypes.forEach((nodeType) => {
    const nodesOfThisType = Math.round(
      Math.random() * ((networkMaxNodes - networkMinNodes) + networkMinNodes),
    );
    nodes.push(...[...Array(nodesOfThisType)].map(() => makeEntity(
      nodeType,
      protocol.codebook.node[nodeType].variables,
    )));
  });

  const ego = makeEntity(null, (protocol.codebook.ego || {}).variables);

  const edges = [];
  const networkMaxEdges = 20;
  const networkMinEdges = 1;
  const pickNodeUid = () => nodes[
    Math.floor(Math.random() * nodes.length)
  ][entityPrimaryKeyProperty];

  codebookEdgeTypes.forEach((edgeType) => {
    const edgesOfThisType = Math.round(
      Math.random() * ((networkMaxEdges - networkMinEdges) + networkMinEdges),
    );

    edges.push(...[...Array(edgesOfThisType)].map(() => ({
      ...makeEntity(
        edgeType,
        protocol.codebook.edge[edgeType].variables,
      ),
      from: pickNodeUid(),
      to: pickNodeUid(),
    })));
  });

  return {
    nodes,
    edges,
    ego,
  };
};

const generateMockNodes = (
  variableDefs,
  typeKey,
  howMany = 0,
  additionalAttributes = {},
) => (dispatch) => times(
  howMany,
  () => {
    const node = makeEntity(typeKey, variableDefs, additionalAttributes);
    const modelData = omit(node, entityAttributesProperty);
    const attributeData = node[entityAttributesProperty];

    dispatch(sessionsActions.addNode(modelData, attributeData));
  },
);

const generateMockSessions = (protocolId, protocol, sessionCount) => (dispatch) => {
  [...Array(sessionCount)].forEach((_, i) => {
    const network = makeNetwork(protocol);

    dispatch(sessionsActions.addSession(
      `case_${i + 1}`,
      protocolId,
      network,
    ));
  });
};

const actionCreators = {
  generateMockNodes,
  generateMockSessions,
};

const actionTypes = {
  MOCK_GENERATE_NODES,
};

export {
  actionCreators,
  actionTypes,
};
