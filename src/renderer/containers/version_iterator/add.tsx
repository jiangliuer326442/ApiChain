import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import type { FormProps } from 'antd';
import { 
  Breadcrumb, Layout, Form, Input, Button, Select, Flex, Descriptions
} from "antd";

import "./less/add.less";
import MarkdownEditor from '@comp/markdown/edit';
import { isStringEmpty, getdayjs } from "@rutil/index";
import { 
    PROJECT_LIST_ROUTE, 
    VERSION_ITERATOR_LIST_ROUTE 
} from "@conf/routers";
import { TABLE_VERSION_ITERATION_FIELDS, UNAME } from '@conf/db';
import { getPrjs } from '@act/project';
import { 
    getVersionIterator,
    addVersionIterator,
    editVersionIterator,
} from '@act/version_iterator';
import { langTrans } from '@lang/i18n';

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
                window.location.href = "index.html#" + VERSION_ITERATOR_LIST_ROUTE;
            });
        } else {
            editVersionIterator(this.state.uuid, title, this.state.content, values.projects, ()=>{
                window.location.href = "index.html#" + VERSION_ITERATOR_LIST_ROUTE;
            });
        }
    };

    render() : ReactNode {
        return (
        <Layout>
            <Header style={{ padding: 0 }}>{langTrans("iterator title")}</Header>
            <Content style={{ padding: '0 16px' }}>
                <Flex justify="space-between" align="center">
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("iterator bread1") }, 
                        { title: <a href={"#" + VERSION_ITERATOR_LIST_ROUTE }> {langTrans("iterator bread2")}</a> },
                        { title: isStringEmpty(this.state.uuid) ? langTrans("iterator add title") : langTrans("iterator edit title")  }, 
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
                            label={langTrans("iterator add form1")}
                            name="title"
                            rules={[{ required: true, message: langTrans("iterator add check1") }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> 
                            name="projects" 
                            label={langTrans("iterator add form2")}
                            rules={[{ required: true, message: langTrans("iterator add check2") }]}>
                            {this.props.prjs.length > 0 ? 
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder={langTrans("iterator add check3")}
                                options={this.props.prjs} />
                            :
                            <Button type="link" href={"#" + PROJECT_LIST_ROUTE}>创建微服务</Button>
                            }    
                        </Form.Item>

                        <Form.Item<FieldType>
                            label={langTrans("iterator add form3")}
                            name="content"
                        >
                            <MarkdownEditor content={this.state.content} cb={content => this.setState({content}) } />
                        </Form.Item>

                        {!isStringEmpty(this.state.uuid) ? 
                        <Descriptions title="">
                            { this.state.version_iteration[version_iterator_openflg] === 0 ?
                            <Descriptions.Item label={langTrans("iterator add form4")}>{ getdayjs(this.state.version_iteration[version_iterator_close_time]).format("YYYY-MM-DD") }</Descriptions.Item>
                            : null }
                            
                            <Descriptions.Item label={langTrans("iterator add form5")}>{ this.state.version_iteration[UNAME] }</Descriptions.Item>
                            <Descriptions.Item label={langTrans("iterator add form6")}>{ getdayjs(this.state.version_iteration[version_iterator_ctime]).format("YYYY-MM-DD") }</Descriptions.Item>
                        </Descriptions>
                        : null}

                        {isStringEmpty(this.state.uuid) ? 
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                {langTrans("iterator add btn")}
                            </Button>
                        </Form.Item>
                         : 
                        ( this.state.version_iteration[version_iterator_openflg] === 1 ? 
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                {langTrans("iterator edit btn")}
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