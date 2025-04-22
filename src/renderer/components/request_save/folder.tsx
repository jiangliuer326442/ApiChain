import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Form, Select, Input, Divider } from "antd";
import { DeleteOutlined } from '@ant-design/icons';

import { langTrans } from '@lang/i18n';
import {
    addVersionIteratorFolder,
    delVersionIteratorFolder,
} from '@act/version_iterator_folders';

class FolderSelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            folderName: "",
        }
    }

    handleCreateFolder = () => {
        addVersionIteratorFolder(
            this.props.versionIterator, 
            this.props.prj, 
            this.state.folderName, this.props.device, async () => {
                this.setState({folderName: ""});
                this.props.refreshFolders()
            }
        );
    }

    render() : ReactNode {
        return (
            <Form.Item label={langTrans("request save select5")}>
                <Select
                    showSearch
                    style={{minWidth: 150}}
                    value={ this.props.value }
                    onChange={ value => this.props.setValue(value) }
                    optionRender={(option) => (
                        <div>
                            <span>{option.label} </span>
                            <DeleteOutlined
                            onClick={(e) => {
                                e.stopPropagation();
                                delVersionIteratorFolder(
                                this.props.versionIterator, 
                                this.props.prj, 
                                option.value, 
                                async () => {
                                    this.props.refreshFolders()
                                });
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
            </Form.Item>
        )
    }

}

function mapStateToProps (state) {
    return {
        device : state.device,
    }
}
  
export default connect(mapStateToProps)(FolderSelector);