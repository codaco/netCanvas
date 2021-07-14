import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ProtocolCard as UIProtocolCard } from '@codaco/ui/lib/components/Cards';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import formatDatestamp from '../../utils/formatDatestamp';
import { APP_SUPPORTED_SCHEMA_VERSIONS, APP_SCHEMA_VERSION } from '../../config';

const ProtocolCard = (props) => {
  const {
    attributes,
    onClickHandler,
    openDialog,
    condensed,
    selected,
  } = props;

  const {
    schemaVersion,
    lastModified,
    installationDate,
    name,
    description,
  } = attributes;

  const isOutdatedProtocol = () => schemaVersion !== APP_SCHEMA_VERSION
    && APP_SUPPORTED_SCHEMA_VERSIONS.includes(schemaVersion);

  const isObsoleteProtocol = () => !APP_SUPPORTED_SCHEMA_VERSIONS.includes(schemaVersion);

  const handleSchemaOutdatedInfo = () => {
    openDialog({
      type: 'Notice',
      title: 'Schema can be updated',
      canCancel: false,
      message: (
        <>
          <p>
            This protocol uses an older version of the protocol file format, or &quot;schema&quot;.
          </p>
          <p>
            Newer schema versions support additional features in Interviewer. We strongly
            suggest that you update your protocols to the latest version, and
            evaluate the newest features as we implement them. To do this, open the original
            protocol file it in the latest version of Architect, and follow the migration
            instructions. Once migrated, install the new version of the protocol on this device.
          </p>
          <p>
            For documentation on this issue, please see our documentation site.
          </p>
          <p>
            In the meantime, you can continue to use this protocol to start interviews or
            export data.
          </p>
        </>
      ),
    });
  };

  const handleSchemaObsoleteInfo = () => {
    openDialog({
      type: 'Error',
      title: 'Obsolete Protocol Schema',
      canCancel: false,
      message: (
        <>
          <p>
            This protocol uses an obsolete version of the protocol file format, or
            &quot;schema&quot;.
          </p>
          <p>
            The version of the schema used by this protocol is incompatible with this version of
            Interviewer. You may still export interview data that has already been collected,
            but you may not start additional interviews.
          </p>
          <p>
            If you require the ability to start interviews, you can either (1) install an updated
            version of this protocol that uses the latest schema, or (2) downgrade your version
            of Interviewer to a version that supports this protocol schema version.
          </p>
          <p>
            For documentation on this issue, please see our documentation site.
          </p>
        </>
      ),
    });
  };

  const handleStatusClick = () => {
    if (isObsoleteProtocol()) {
      handleSchemaObsoleteInfo();
      return;
    }

    handleSchemaOutdatedInfo();
  };

  return (
    <UIProtocolCard
      selected={selected}
      schemaVersion={schemaVersion}
      lastModified={lastModified}
      installationDate={formatDatestamp(installationDate)}
      name={name}
      condensed={condensed}
      description={description}
      isOutdated={isOutdatedProtocol()}
      isObsolete={isObsoleteProtocol()}
      onStatusClickHandler={handleStatusClick}
      onClickHandler={onClickHandler}
    />
  );
};

ProtocolCard.defaultProps = {
  onClickHandler: undefined,
  description: null,
  condensed: false,
};

ProtocolCard.propTypes = {
  onClickHandler: PropTypes.func,
  openDialog: PropTypes.func.isRequired,
  condensed: PropTypes.bool,
  description: PropTypes.string,
  attributes: PropTypes.shape({
    schemaVersion: PropTypes.number.isRequired,
    lastModified: PropTypes.string.isRequired,
    installationDate: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,

};

const mapDispatchToProps = {
  openDialog: dialogActions.openDialog,
};

export default connect(null, mapDispatchToProps)(ProtocolCard);
