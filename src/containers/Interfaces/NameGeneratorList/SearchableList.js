import React, { useMemo, useState, useEffect } from 'react';
/* eslint-disable import/prefer-default-export */
import Fuse from 'fuse.js';
import { sortBy } from 'lodash/fp';
import HyperList from './HyperList';

const defaultFuseOpts = {
  threshold: 0.5,
  minMatchCharLength: 1,
  shouldSort: true,
  tokenize: true, // Break up query so it can match across different fields
  keys: ['label'],
};

const getFuseOptions = (options) => {
  const threshold = typeof options.fuzziness !== 'number'
    ? defaultFuseOpts.threshold
    : options.fuzziness;

  return {
    ...defaultFuseOpts,
    // keys: options.matchProperties,
    threshold,
  };
};
// const searchOptions = { matchProperties: [], ...stage.searchOptions };

// // Map the matchproperties to add the entity attributes object, and replace names with
// // uuids, where possible.
// searchOptions.matchProperties = searchOptions.matchProperties.map((prop) => {
//   const nodeTypeVariables = nodeTypeDefinition.variables;
//   const replacedProp = getParentKeyByNameValue(nodeTypeVariables, prop);
//   return (`${entityAttributesProperty}.${replacedProp}`);
// });

// // If false, suppress candidate from appearing in search results —
// // for example, if the node has already been selected.
// // Assumption:
// //   `excludedNodes` size is small, but search set may be large,
// //   and so preferable to filter found results dynamically.
// const isAllowedResult = (candidate) => excludedNodes.every(
//   (excluded) => excluded[entityPrimaryKeyProperty] !== candidate[entityPrimaryKeyProperty],
// );

const useSearch = (list, options) => {
  const fuse = useMemo(
    () => new Fuse(list, getFuseOptions(options)),
    [list, options],
  );

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(list);

  useEffect(() => {
    if (query.length <= 1) {
      setResults(list);
      return;
    }

    setResults(fuse.search(query));
  }, [fuse, query]);

  return [results, query, setQuery];
};

const useSort = (list, initialSortBy = 'label', initialDirection = 'desc') => {
  const [sortByProperty, setSortByProperty] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const toggleSortDirection = () => setSortDirection(
    (d) => (d === 'desc' ? 'asc' : 'desc'),
  );

  const updateSortByProperty = (property) => {
    if (property === sortBy) {
      toggleSortDirection();
      return;
    }

    setSortByProperty(property);
    setSortDirection('desc');
  };

  const sortedList = useMemo(() => (
    sortDirection === 'desc'
      ? sortBy(sortByProperty)(list)
      : sortBy(sortByProperty)(list).reverse()
  ), [list, sortBy, sortDirection]);

  console.log({ list, sortedList });

  return [sortedList, updateSortByProperty, toggleSortDirection];
};

/**
  * SearchableList
  */
const SearchableList = ({
  columns,
  itemComponent,
  items,
  rowHeight,
  sortableProperties,
  searchOptions,
}) => {
  const [results, query, setQuery] = useSearch(items, searchOptions);
  const [sortedResults, sortByProperty, toggleSortDirection] = useSort(results);

  const handleChangeSearch = (e) => {
    setQuery(e.target.value || '');
  };

  return (
    <div className="searchable-list" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      { sortableProperties.length > 0 && (
        <div className="searchable-list__sort">
          {sortableProperties.map(({ variable, label }) => (
            <button onClick={() => sortByProperty(variable)} type="button">
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="searchable-list__list" style={{ flex: 1, display: 'flex' }}>
        <HyperList
          items={sortedResults}
          itemComponent={itemComponent}
          columns={columns}
          rowHeight={rowHeight}
        />
      </div>
      <div className="searchable-list__search">
        <input type="text" value={query} onChange={handleChangeSearch} />
      </div>
    </div>
  );
};

SearchableList.propTypes = {
};

SearchableList.defaultProps = {
  columns: undefined,
  rowHeight: undefined,
  itemComponent: null,
  items: [],
  sortableProperties: [],
  searchOptions: {},
};

export default SearchableList;