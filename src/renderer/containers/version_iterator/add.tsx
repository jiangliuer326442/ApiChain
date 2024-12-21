import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import type { FormProps } from 'antd';
import { 
  Breadcrumb, Layout, Form, Input, Button, Select, Flex, Descriptions
} from "antd";

import "./less/add.less";
import { isStringEmpty, getdayjs } from "../../util";
import { 
    PROJECT_LIST_ROUTE, 
    VERSION_ITERATOR_LIST_ROUTE 
} from "../../../config/routers";
import { TABLE_VERSION_ITERATION_FIELDS, UNAME } from '../../../config/db';
import { getPrjs } from '../../actions/project';
import { 
    getVersionIterator,
    addVersionIterator,
    editVersionIterator,
    getVersionIterators
} from '../../actions/version_iterator';
import MarkdownEditor from '../../components/markdown/edit';

const { Header, Content, Footer } = Layout;

let version_iterator_title = TABLE_VERSION_ITERATION_FIELDS.FIELD_NAME;
let version_iterator_prjs = TABLE_VERSION_ITERATION_FIELDS.FIELD_PROJECTS;
let version_iterator_content = TABLE_VERSION_ITERATION_FIELDS.FIELD_CONTENT;
let version_iterator_openflg = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_close_time = TABLE_VERSION_ITERATION_FIELDS.FIELD_CLOSE_TIME;
let version_iterator_ctime = TABLE_VERSION_ITERATION_FIELDS.FIELD_CTIME;

type FieldType = {
    title: string;
    projects?: Array<string>;
    content?: string;
};

class VersionIteratorAdd extends Component {

    constructor(props) {
        super(props);
        this.state = {
            formReadyFlg: false,
            uuid: "",
            version_iteration: {},
            content: "",
        }
    }

    async componentDidMount() {
        if ('uuid' in this.props.match.params) {
            let uuid = this.props.match.params.uuid;
            let version_iteration = await getVersionIterator(uuid);
            this.setState({
                uuid, version_iteration, 
                formReadyFlg: true,
                content: version_iteration[version_iterator_content],
            })
        } else {
            this.setState({formReadyFlg: true})
        }
        if(this.props.prjs.length === 0) {
            getPrjs(this.props.dispatch);
        }
    }

    onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        let title = values.title.trim();
        if(isStringEmpty(this.state.uuid)) {
            addVersionIterator(title, this.state.content, values.projects, this.props.device, ()=>{
                getVersionIterators(this.props.dispatch);
                window.location.href = "index.html#" + VERSION_ITERATOR_LIST_ROUTE;
            });
        } else {
            editVersionIterator(this.state.uuid, title, this.state.content, values.projects, ()=>{
                getVersionIterators(this.props.dispatch);
                window.location.href = "index.html#" + VERSION_ITERATOR_LIST_ROUTE;
            });
        }
    };

    render() : ReactNode {
        return (
        <Layout>
            <Header style={{ padding: 0 }}>版本迭代</Header>
            <Content style={{ margin: '0 16px' }}>
                <Flex justify="space-between" align="center">
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: '设置' }, 
                        { title: <a href={"#" + VERSION_ITERATOR_LIST_ROUTE }> 迭代管理</a> },
                        { title: isStringEmpty(this.state.uuid) ? '新增迭代' : '编辑迭代'  }, 
                    ]} />
                </Flex>
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                    }}
                >
                    {this.state.formReadyFlg ? 
                    <Form
                        layout='vertical'
                        style={{ maxWidth: 600 }}
                        initialValues={{
                            title: this.state.version_iteration[version_iterator_title],
                            projects: this.state.version_iteration[version_iterator_prjs]
                        }}
                        onFinish={this.onFinish}
                        autoComplete="off"
                        disabled={this.state.version_iteration[version_iterator_openflg] === 0}
                    >
                        <Form.Item<FieldType>
                            label="迭代名称"
                            name="title"
                            rules={[{ required: true, message: '请输入迭代名称' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> 
                            name="projects" 
                            label="使用微服务" 
                            rules={[{ required: true, message: '选择迭代涉及的项目' }]}>
                            {this.props.prjs.length > 0 ? 
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="选择使用到的微服务"
                                options={this.props.prjs} />
                            :
                            <Button type="link" href={"#" + PROJECT_LIST_ROUTE}>创建微服务</Button>
                            }    
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="迭代说明"
                            name="content"
                        >
                            <MarkdownEditor content={this.state.content} cb={content => this.setState({content}) } />
                        </Form.Item>

                        {!isStringEmpty(this.state.uuid) ? 
                        <Descriptions title="">
                            { this.state.version_iteration[version_iterator_openflg] === 0 ?
                            <Descriptions.Item label="关闭时间">{ getdayjs(this.state.version_iteration[version_iterator_close_time]).format("YYYY-MM-DD") }</Descriptions.Item>
                            : null }
                            
                            <Descriptions.Item label="创建人">{ this.state.version_iteration[UNAME] }</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{ getdayjs(this.state.version_iteration[version_iterator_ctime]).format("YYYY-MM-DD") }</Descriptions.Item>
                        </Descriptions>
                        : null}

                        {isStringEmpty(this.state.uuid) ? 
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                新增
                            </Button>
                        </Form.Item>
                         : 
                        ( this.state.version_iteration[version_iterator_openflg] === 1 ? 
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    修改
                                </Button>
                            </Form.Item>
                        : null )
                        }
                    </Form>
                    : null}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
            ApiChain ©{new Date().getFullYear()} Created by 方海亮
            </Footer>
        </Layout>
        );
    }
}

function mapStateToProps (state) {
  return {
      prjs: state.prj.selector,
      device : state.device,
  }
}

export default connect(mapStateToProps)(VersionIteratorAdd);