import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Select, Input, Divider } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import { langTrans } from '@lang/i18n';
import {
    addIteratorFolder,
} from '@act/version_iterator_folders';
import {
    addProjectFolder,
    delProjectFolder,
} from '@act/project_folders';
import { isStringEmpty } from '@rutil/index';
import { FoldSourceIterator, FoldSourcePrj } from '@conf/global_config';

class FolderSelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            folderName: "",
        }
    }

    handleCreateFolder = async () => {
        if (isStringEmpty(this.props.versionIterator)) {
            await addProjectFolder(
                this.props.clientType,
                this.props.teamId,
                this.props.prj, 
                this.state.folderName, 
                this.props.device
            );
        } else {
            await addIteratorFolder(
                this.props.clientType,
                this.props.teamId,
                this.props.versionIterator, 
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
                        <DeleteOutlined
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (isStringEmpty(this.props.versionIterator)) {
                                let folder = option.value.substring(FoldSourcePrj.length);
                                await delProjectFolder(this.props.clientType, this.props.teamId, this.props.prj, folder)
                            } else {

                            }
                            this.props.refreshFolders()
                        }}
                        />
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