import { Component, ReactNode } from 'react';
import { DeleteOutlined } from '@ant-design/icons';

import { FoldSourcePrj, FoldSourceIterator } from '@conf/global_config';

class RequestListCollapseExtra extends Component {
    render() : ReactNode {
        return (!(this.props.folder === FoldSourcePrj || this.props.folder === FoldSourceIterator) ?
            <DeleteOutlined onClick={event => {
                delFolder("", this.state.projectLabel, fold, async ()=>{
                    message.success("删除文件夹成功");
                    let folders = await getProjectFolders(this.props.clientType, this.state.projectLabel);
                    this.onFinish({
                        title: this.state.title, 
                        uri: this.state.uri,
                        folders
                    });
                });
                event.stopPropagation();
            }} />
        : null);
    }
}

export default RequestListCollapseExtra;