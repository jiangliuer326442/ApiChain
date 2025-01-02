import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Form,
    Input,
    Modal,
    Select,
    Divider,
    message,
} from "antd";

import { isStringEmpty } from '@rutil/index';
import { SHOW_ADD_UNITTEST_MODEL } from '@conf/redux';
import { addIteratorUnitTest, editUnitTest } from '@act/unittest';
import { 
    addIteratorUnitTestFolder, 
    getIteratorUnitTestFolders,
    addProjectUnitTestFolder,
    getProjectUnitTestFolders, 
} from '@act/unittest_folders';

class AddUnittestComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            actionType: "",
            loadingFlg: false,
            unitTestTitle: "",
            selectedFolder: null,
            folders: [],
            folderName: "",
            unitTestUuid: "",
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {  
        if (isStringEmpty(nextProps.unitTestUuid)) {
            return {actionType: "create"};
        } else if (isStringEmpty(prevState.unitTestUuid)) {
            return {
                actionType: "edit",
                unitTestUuid: nextProps.unitTestUuid,
                unitTestTitle: nextProps.title,
                selectedFolder: nextProps.folder,
            };
        } 
        return null;
    }

    handleOk = () => {
        const unitTestTitle = this.state.unitTestTitle.trim();
        const selectedFolder = this.state.selectedFolder;

        if (isStringEmpty(unitTestTitle)) {
            message.error('请输入测试用例名称');
            return;
        }

        if (selectedFolder === null) {
            message.error('请选择测试用例所属文件夹');
            return;
        }

        this.setState({
            loadingFlg: true
        });

        if (this.state.actionType === "create") {
            if (isStringEmpty(this.props.project)) {
                addIteratorUnitTest(this.props.iteratorId, unitTestTitle, selectedFolder, this.props.device, () => {
                    this.clearInput();
                    this.setState({
                        loadingFlg: false
                    });
                    this.props.refreshCb();
                    this.props.dispatch({
                        type: SHOW_ADD_UNITTEST_MODEL,
                        open: false,
                        unitTestUuid: "",
                    });
                });
            }
        } else {
            editUnitTest(this.state.unitTestUuid, unitTestTitle, selectedFolder, () => {
                this.clearInput();
                this.setState({
                    loadingFlg: false
                });
                this.props.refreshCb();
                this.props.dispatch({
                    type: SHOW_ADD_UNITTEST_MODEL,
                    open: false,
                    unitTestUuid: "",
                });
            });
        }
    };

    handleCancel = () => {
        this.clearInput();
        this.props.dispatch({
            type: SHOW_ADD_UNITTEST_MODEL,
            open: false,
            unitTestUuid: ""
        });
    }

    clearInput = () => {
        this.setState({
            loadingFlg: false,
            unitTestTitle: "",
            selectedFolder: "",
            folders: [],
            actionType: "",
            unitTestUuid: "",
        });
    }

    componentDidUpdate(prevProps) {  
        if (!isStringEmpty(this.props.project) && this.props.project !== prevProps.project) {  
            getProjectUnitTestFolders(this.props.project, folders => this.setState({ folders }));
        } else if (!isStringEmpty(this.props.iteratorId) && this.props.iteratorId !== prevProps.iteratorId) {  
            getIteratorUnitTestFolders(this.props.iteratorId, folders => this.setState({ folders }));
        }  
    }

    handleCreateFolder = () => {
        if (isStringEmpty(this.props.project)) {
            addIteratorUnitTestFolder(this.props.iteratorId, this.state.folderName, this.props.device, ()=>{
                this.setState({folderName: ""});
                getIteratorUnitTestFolders(this.props.iteratorId, folders => this.setState({ folders }));
            });
        } else {
            addProjectUnitTestFolder(this.props.project, this.state.folderName, this.props.device, ()=>{
                this.setState({folderName: ""});
                getProjectUnitTestFolders(this.props.project, folders => this.setState({ folders }));
            });
        }
    }

    render() : ReactNode {
        return (
            <Modal
                title={this.state.actionType === "create" ? "添加单元测试" : "编辑单元测试"}
                open={this.props.open}
                onOk={this.handleOk}
                confirmLoading={this.state.loadingFlg}
                onCancel={this.handleCancel}
                width={230}
            >
                <Form layout="vertical">
                    <Form.Item>
                        <Input placeholder="测试用例名称" value={this.state.unitTestTitle} onChange={ event=>this.setState({unitTestTitle : event.target.value}) } />
                    </Form.Item>
                    <Form.Item>
                        <Select
                            placeholder="所属文件夹"
                            style={{minWidth: 130}}
                            value={ this.state.selectedFolder }
                            onChange={ value => this.setState({selectedFolder: value}) }
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Input
                                        placeholder="回车新建文件夹"
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
                            options={ this.state.folders }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        )
    }

}

function mapStateToProps (state) {
    return {
        open : state.unittest.showAddUnittestModelFlg,
        iteratorId: state.unittest.iteratorId,
        project: state.unittest.project,
        device : state.device,
        unitTestUuid: state.unittest.unitTestUuid,
        title: state.unittest.title,
        folder: state.unittest.folder,
    }
}

export default connect(mapStateToProps)(AddUnittestComponent);