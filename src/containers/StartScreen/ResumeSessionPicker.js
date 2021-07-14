import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';
import { SessionCard } from '@codaco/ui/lib/components/Cards';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import formatDatestamp from '../../utils/formatDatestamp';
import Picker from '../../components/Picker';

const oneBasedIndex = (i) => parseInt(i || 0, 10) + 1;

const ResumeSessionPicker = ({
  show,
  onClose,
}) => {
  const dispatch = useDispatch();
  const setSession = (sessionUID) => dispatch(sessionActions.setSession(sessionUID));

  const sessions = useSelector((state) => state.sessions);
  const installedProtocols = useSelector((state) => state.installedProtocols);

  const handleSessionCardClick = (sessionUUID) => {
    setSession(sessionUUID);
    onClose();
  };

  const formattedSessions = [...Object.keys(sessions)].map((sessionUUID) => {
    const session = sessions[sessionUUID];
    const protocol = get(installedProtocols, [session.protocolUID]);

    const progress = Math.round(
      (oneBasedIndex(session.stageIndex) / oneBasedIndex(protocol.stages.length)) * 100,
    );

    return {
      caseId: session.caseId,
      startedAt: formatDatestamp(session.startedAt),
      updatedAt: formatDatestamp(session.updatedAt),
      finishedAt: formatDatestamp(session.finishedAt),
      exportedAt: formatDatestamp(session.exportedAt),
      protocolName: protocol.name,
      progress,
      onClickHandler: () => handleSessionCardClick(sessionUUID),
    };
  });

  return (
    <Picker
      show={show}
      onClose={onClose}
      title="Select an Interview to Resume"
      ItemComponent={SessionCard}
      items={formattedSessions}
      propertyPath={null}
      initialSortProperty="updatedAt"
      initialSortDirection="desc"
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
  );
};

export default ResumeSessionPicker;
