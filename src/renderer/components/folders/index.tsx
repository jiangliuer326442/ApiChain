import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Select, Input, Divider } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import { langTrans } from '@lang/i18n';
import {
    addIteratorFolder,
    delIteratorFolder,
} from '@act/version_iterator_folders';
import {
    addProjectFolder,
    delProjectFolder,
} from '@act/project_folders';
import { FoldSourceIterator, FoldSourcePrj } from '@conf/global_config';

class FolderSelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            folderName: "",
        }
    }

    handleCreateFolder = async () => {
        if (this.props.type === "prj") {
            let prj = this.props.metadata;
            await addProjectFolder(
                this.props.clientType,
                this.props.teamId,
                prj, 
                this.state.folderName, 
                this.props.device
            );
        } else {
            let iteratorId = this.props.metadata.split("$$")[0];
            await addIteratorFolder(
                this.props.clientType,
                this.props.teamId,
                iteratorId, 
                "", 
                this.state.folderName, 
                this.props.device
            );
        }
        this.setState({folderName: ""});
        this.props.refreshFolders()
    }

    render() : ReactNode {
        return (
            <Select
                showSearch
                allowClear
                style={{minWidth: 180}}
                value={ this.props.value }
                onChange={ value => {
                    this.props.setValue(value)
                } }
                optionRender={(option) => (
                        <div>
                            <span>{option.label} </span>
                        {option.value === FoldSourcePrj || option.value === FoldSourceIterator ? null : 
                            <DeleteOutlined
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (this.props.type === "prj") {
                                        let prj = this.props.metadata;
                                        let folder = option.value.substring(FoldSourcePrj.length);
                                        await delProjectFolder(this.props.clientType, this.props.teamId, prj, folder)
                                    } else if (this.props.type === "iterator") {
                                        let iteratorId = this.props.metadata.split("$$")[0];
                                        let prj = this.props.metadata.split("$$")[1];
                                        let folder = option.value.substring(FoldSourceIterator.length);
                                        console.log("delIteratorFolder", iteratorId, prj, folder)
                                        await delIteratorFolder(this.props.clientType, this.props.teamId, iteratorId, prj, folder);
                                    }
                                    this.props.refreshFolders()
                                }}
                            />
                        }
                        </div>
                )}
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Input
                            placeholder={langTrans("request save tip5")}
                            onChange={e => { this.setState({ folderName: e.target.value }) }}
                            value={ this.state.folderName }
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    this.handleCreateFolder();
                                }
                                e.stopPropagation()
                            }}
                        />
                    </>
                )}
                options={ this.props.folders }
            />
        )
    }

}

function mapStateToProps (state) {
    return {
        device : state.device,
        teamId: state.device.teamId,
        clientType: state.device.clientType,
    }
}
  
export default connect(mapStateToProps)(FolderSelector);