import React, { useState, useEffect } from 'react';
import { get, difference } from 'lodash';
import { useSelector } from 'react-redux';
import { SessionCard } from '@codaco/ui/lib/components/Cards';
import { Switch } from '../../components';
import NewFilterableListWrapper, { getFilteredList } from '../../components/NewFilterableListWrapper';
import formatDatestamp from '../../utils/formatDatestamp';

const oneBasedIndex = (i) => parseInt(i || 0, 10) + 1;

const SessionSelect = ({
  selectedSessions,
  setSelectedSessions,
}) => {
  const sessions = useSelector((state) => state.sessions);
  const [filterTerm, setFilterTerm] = useState(null);

  const installedProtocols = useSelector((state) => state.installedProtocols);

  const handleFilterChange = (term) => setFilterTerm(term);

  const handleSessionCardClick = (sessionUUID) => {
    if (selectedSessions.includes(sessionUUID)) {
      setSelectedSessions([
        ...selectedSessions.filter((session) => session !== sessionUUID),
      ]);

      return;
    }

    setSelectedSessions((alreadySelected) => [
      ...alreadySelected,
      sessionUUID,
    ]);
  };

  const formattedSessions = [...Object.keys(sessions)].map((sessionUUID) => {
    const session = sessions[sessionUUID];

    const {
      caseId,
      startedAt,
      updatedAt,
      finishedAt,
      exportedAt,
    } = session;

    const protocol = get(installedProtocols, [session.protocolUID]);
    const progress = Math.round(
      (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
    );

    return {
      caseId,
      progress,
      startedAt: formatDatestamp(startedAt),
      finishedAt: formatDatestamp(finishedAt),
      updatedAt: formatDatestamp(updatedAt),
      exportedAt: formatDatestamp(exportedAt),
      key: sessionUUID,
      protocolName: protocol.name,
      sessionUUID,
      selected: selectedSessions.includes(sessionUUID),
      onClickHandler: () => handleSessionCardClick(sessionUUID),
    };
  });

  const [filteredSessions, setFilteredSessions] = useState(formattedSessions);
  const filteredIds = filteredSessions.map(({ sessionUUID }) => sessionUUID);

  useEffect(() => {
    const newFilteredSessions = getFilteredList(formattedSessions, filterTerm, null);

    setFilteredSessions(newFilteredSessions);
  }, [filterTerm, selectedSessions]);

  const isSelectAll = (
    selectedSessions.length > 0
    && selectedSessions.length === filteredIds.length
    && difference(selectedSessions, filteredIds).length === 0
  );

  const toggleSelectAll = () => {
    if (!isSelectAll) {
      setSelectedSessions([...filteredIds]);
      return;
    }

    setSelectedSessions([]);
  };

  const unexportedSessions = filteredSessions
    .reduce((acc, { exportedAt, sessionUUID }) => {
      if (exportedAt) { return acc; }
      return [...acc, sessionUUID];
    }, []);

  const isUnexportedSelected = (
    unexportedSessions.length > 0
    && selectedSessions.length > 0
    && selectedSessions.length === unexportedSessions.length
    && difference(selectedSessions, unexportedSessions).length === 0
  );

  const toggleSelectUnexported = () => {
    if (!isUnexportedSelected) {
      setSelectedSessions(unexportedSessions);
      return;
    }

    setSelectedSessions([]);
  };

  const exportedSessions = filteredSessions
    .reduce((acc, { exportedAt, sessionUUID }) => {
      if (!exportedAt) { return acc; }
      return [...acc, sessionUUID];
    }, []);

  const isExportedSelected = (
    exportedSessions.length > 0
    && selectedSessions.length > 0
    && selectedSessions.length === exportedSessions.length
    && difference(selectedSessions, exportedSessions).length === 0
  );

  const toggleSelectExported = () => {
    if (!isExportedSelected) {
      setSelectedSessions(exportedSessions);
      return;
    }

    setSelectedSessions([]);
  };

  return (
    <>
      <NewFilterableListWrapper
        ItemComponent={SessionCard}
        items={filteredSessions}
        propertyPath={null}
        initialSortProperty="updatedAt"
        initialSortDirection="desc"
        onFilterChange={handleFilterChange}
        sortableProperties={[
          {
            label: 'Last Changed',
            variable: 'updatedAt',
          },
          {
            label: 'Case ID',
            variable: 'caseId',
          },
          {
            label: 'Progress',
            variable: 'progress',
          },
        ]}
      />
      <div className="selection-status">
        <div className="selection-controls">
          <div>
            <Switch
              disabled={!exportedSessions.length > 0}
              label="Select exported"
              on={isExportedSelected}
              onChange={toggleSelectExported}
            />
            <Switch
              disabled={!unexportedSessions.length > 0}
              label="Select un-exported"
              on={isUnexportedSelected}
              onChange={toggleSelectUnexported}
            />
            <Switch
              label="Select all"
              on={isSelectAll}
              onChange={toggleSelectAll}
            />
          </div>
          { selectedSessions.length > 0 && (
            <strong>
              { selectedSessions.length}
              {' '}
              selected session
              { selectedSessions.length > 1 ? ('s') : null }
              .
            </strong>
          )}
        </div>
      </div>
    </>
  );
};

export default SessionSelect;
