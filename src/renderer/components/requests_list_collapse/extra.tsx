import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';

import { FoldSourcePrj, FoldSourceIterator } from '@conf/global_config';
import { delProjectFolder } from '@act/project_folders';

class RequestListCollapseExtra extends Component {
    render() : ReactNode {
        return (!(this.props.folder === FoldSourcePrj || this.props.folder === FoldSourceIterator) ?
            <DeleteOutlined onClick={async event => {
                if (this.props.type === "prj") {
                    let folder  = this.props.folder.substring(FoldSourcePrj.length);
                    let prj = this.props.metadata;
                    await delProjectFolder(this.props.clientType, this.props.teamId, prj, folder)
                } else if (this.props.type === "iterator") {
                }
                this.props.refreshCallback();
                event.stopPropagation();
            }} />
        : null);
    }
}

function mapStateToProps (state) {
    return {
      teamId: state.device.teamId,
      clientType: state.device.clientType,
    }
}

export default connect(mapStateToProps)(RequestListCollapseExtra);