import React, { useState } from 'react';
import { get } from 'lodash';
import objectHash from 'object-hash';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Spinner } from '@codaco/ui';
import { Search } from '@codaco/ui/lib/components/Fields';
import { entityAttributesProperty } from '../ducks/modules/network';
import sortOrder from '../utils/sortOrder';

export const getFilteredList = (items, filterTerm, propertyPath) => {
  if (!filterTerm) { return items; }

  const normalizedFilterTerm = filterTerm.toLowerCase();

  return items.filter(
    (item) => {
      const itemAttributes = propertyPath ? Object.values(get(item, propertyPath, {}))
        : Object.values(item);
      // Include in filtered list if any of the attribute property values
      // include the filter value
      return itemAttributes.some(
        (property) => property && property.toString().toLowerCase().includes(normalizedFilterTerm),
      );
    },
  );
};

const containerVariants = {
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      when: 'beforeChildren',
    },
  },
  hide: {
    opacity: 0,
    transition: {
      when: 'afterChildren',
    },
  },
};

const itemVariants = {
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
    },
  },
  hide: {
    opacity: 0,
    y: 50,
    transition: {
      type: 'spring',
    },
  },
};

const NewFilterableListWrapper = (props) => {
  const {
    items,
    propertyPath,
    ItemComponent,
    initialSortProperty,
    initialSortDirection,
    sortableProperties,
    loading,
    onFilterChange,
  } = props;

  const [filterTerm, setFilterTerm] = useState(null);
  const [sortProperty, setSortProperty] = useState(initialSortProperty);
  const [sortAscending, setSortAscending] = useState(initialSortDirection === 'asc');

  const handleSetSortProperty = (property) => {
    if (sortProperty === property) {
      setSortAscending(!sortAscending);
    } else {
      setSortAscending(true);
      setSortProperty(property);
    }
  };

  const handleFilterChange = (event) => {
    const value = get(event, 'target.value', null);
    setFilterTerm(value);
    if (onFilterChange) { onFilterChange(value); }
  };

  const filteredItems = onFilterChange ? items : getFilteredList(items, filterTerm, propertyPath);

  const sortedItems = sortOrder([{
    property: sortProperty,
    direction: sortAscending ? 'asc' : 'desc',
  }], {}, propertyPath)(filteredItems);

  return (
    <div className="new-filterable-list">
      <header className="new-filterable-list__header">
        <section className="new-filterable-list__header-section new-filterable-list__header-section--sort">
          { (sortableProperties && sortableProperties.length > 0)
            && (
            <div className="scroll-container">
              {sortableProperties.map((sortField) => (
                <div
                  tabIndex="0"
                  role="button"
                  className={`filter-button ${sortProperty === sortField.variable ? 'filter-button--active' : ''}`}
                  key={sortField.variable}
                  onClick={() => handleSetSortProperty(sortField.variable)}
                >
                  {
                    (sortField.label)
                  }
                  {
                    sortProperty === sortField.variable && (sortAscending ? ' \u25B2' : ' \u25BC')
                  }
                </div>
              ))}
            </div>
            )}
        </section>
        <section className="new-filterable-list__header-section new-filterable-list__header-section--filter">
          <Search
            type="search"
            placeholder="Filter..."
            className="new-filterable-list__filter"
            input={{
              value: filterTerm || '',
              onChange: handleFilterChange,
            }}
          />
        </section>
      </header>
      <motion.main
        layout
        variants={containerVariants}
        initial="hide"
        animate="show"
        className="new-filterable-list__main"
      >
        {
          loading ? (
            <motion.div
              className="loading-state"
              layout
              key="loader"
            >
              <Spinner small />
              <h4>Loading...</h4>
            </motion.div>
          ) : (
            <AnimatePresence>
              {
                sortedItems.length > 0 && sortedItems.map((item) => (
                  <motion.div
                    variants={itemVariants}
                    key={item.key || objectHash(item)}
                    exit="hide"
                    layout
                  >
                    <ItemComponent {...item} />
                  </motion.div>
                ))
              }
            </AnimatePresence>
          )
        }
      </motion.main>
    </div>
  );
};

NewFilterableListWrapper.propTypes = {
  ItemComponent: PropTypes.elementType.isRequired,
  items: PropTypes.array.isRequired,
  propertyPath: PropTypes.string,
  initialSortProperty: PropTypes.string.isRequired,
  initialSortDirection: PropTypes.oneOf(['asc', 'desc']),
  sortableProperties: PropTypes.array,
  loading: PropTypes.bool,
  resetFilter: PropTypes.array,
  onFilterChange: PropTypes.func,
};

NewFilterableListWrapper.defaultProps = {
  initialSortDirection: 'asc',
  propertyPath: entityAttributesProperty,
  sortableProperties: [],
  loading: false,
  resetFilter: [],
  onFilterChange: null,
};

export default NewFilterableListWrapper;
