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
import { langTrans } from '@lang/i18n';

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

    handleOk = async () => {
        const unitTestTitle = this.state.unitTestTitle.trim();
        const selectedFolder = this.state.selectedFolder;

        if (isStringEmpty(unitTestTitle)) {
            message.error(langTrans("unittest add check1"));
            return;
        }

        if (selectedFolder === null) {
            message.error(langTrans("unittest add check2"));
            return;
        }

        this.setState({
            loadingFlg: true
        });

        if (this.state.actionType === "create") {
            if (isStringEmpty(this.props.project)) {
                await addIteratorUnitTest(this.props.iteratorId, unitTestTitle, selectedFolder, this.props.device);
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
            }
        } else {
            await editUnitTest(this.state.unitTestUuid, unitTestTitle, selectedFolder);
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

    handleCreateFolder = async () => {
        if (isStringEmpty(this.props.project)) {
            await addIteratorUnitTestFolder(this.props.iteratorId, this.state.folderName, this.props.device);
            this.setState({folderName: ""});
            getIteratorUnitTestFolders(this.props.iteratorId, folders => this.setState({ folders }));
        } else {
            await addProjectUnitTestFolder(this.props.project, this.state.folderName, this.props.device);
            this.setState({folderName: ""});
            getProjectUnitTestFolders(this.props.project, folders => this.setState({ folders }));
        }
    }

    render() : ReactNode {
        return (
            <Modal
                title={this.state.actionType === "create" ? langTrans("unittest add title") : langTrans("unittest edit title")}
                open={this.props.open}
                onOk={this.handleOk}
                confirmLoading={this.state.loadingFlg}
                onCancel={this.handleCancel}
                width={230}
            >
                <Form layout="vertical">
                    <Form.Item>
                        <Input placeholder={langTrans("unittest add form1")} value={this.state.unitTestTitle} onChange={ event=>this.setState({unitTestTitle : event.target.value}) } />
                    </Form.Item>
                    <Form.Item>
                        <Select
                            placeholder={langTrans("unittest add form2")}
                            style={{minWidth: 130}}
                            value={ this.state.selectedFolder }
                            onChange={ value => this.setState({selectedFolder: value}) }
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Input
                                        placeholder={langTrans("unittest add act1")}
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