import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Breadcrumb, Layout, Flex, Form, Tooltip,
    Input, Button, DatePicker, Table, Space
} from "antd";
import { EyeOutlined } from '@ant-design/icons';
import type { FormProps } from 'antd';
import JsonView from 'react-json-view';

import { 
    getNowdayjs,
    getdayjs,
    isStringEmpty, 
} from '@rutil/index';
import { 
    TABLE_REQUEST_HISTORY_FIELDS,
} from '@conf/db';
import { GET_ENV_VALS } from '@conf/redux';
import { getRequestHistorys } from "@act/request_history";
import SelectPrjEnvComponent from "@comp/env_var/select_prj_env";
import { langTrans } from '@lang/i18n';
import { REQUEST_METHOD_GET } from '@conf/global_config';

const { Header, Content, Footer } = Layout;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

type FieldType = {
    uri?: string;
    btime?: number;
    etime?: number;
};

let id = TABLE_REQUEST_HISTORY_FIELDS.FIELD_ID;
let method = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_METHOD;
let uri = TABLE_REQUEST_HISTORY_FIELDS.FIELD_URI;
let body = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_BODY;
let param = TABLE_REQUEST_HISTORY_FIELDS.FIELD_REQUEST_PARAM;
let response = TABLE_REQUEST_HISTORY_FIELDS.FIELD_RESPONSE_CONTENT;
let jsonFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_JSONFLG;
let htmlFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_HTMLFLG;
let picFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_PICFLG;
let fileFlg = TABLE_REQUEST_HISTORY_FIELDS.FIELD_FILEFLG;

let ctime = TABLE_REQUEST_HISTORY_FIELDS.FIELD_CTIME;

class RequestHistoryContainer extends Component {

    constructor(props) {
      super(props);
      this.state = {
        id: 0,
        list: [],
        loadDataFlg: false,
        prj : "",
        env : "",
        uri : "",
        btime: getNowdayjs().subtract(1, 'day').valueOf(),
        etime: getNowdayjs().valueOf(),
      }
    }

    getEnvValueData = (prj: string, env: string) => {
        if(!(isStringEmpty(prj) || isStringEmpty(env))) {
            if (!this.state.loadDataFlg) {
                getRequestHistorys(env, prj, this.state.btime, this.state.etime, "", list => {
                    let datas = [];
                    list.map(item => {
                        item.key = item[id];
                        datas.push(item);
                    });
                    this.setState({list: datas});
                });
            }
            this.setState({
                loadDataFlg: true,
                prj,
                env,
            });
        }
    }

    onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        this.props.dispatch({
            type: GET_ENV_VALS,
            prj: this.state.prj,
            env: this.state.env,
            iterator: "",
            unittest: ""
        });
        getRequestHistorys(this.state.env, this.state.prj, this.state.btime, this.state.etime, values.uri, list => {
            let datas = [];
            list.map(item => {
                item.key = item[id];
                datas.push(item);
            });
            this.setState({list: datas, uri: values.uri});
        });
    }

    listColumn = () => {
        return [
            {
                title: langTrans("log field1"),
                dataIndex: "url",
                width: 240,
                render: (_, record) => { 
                    return <Tooltip title={record[uri]} placement='right'>
                        { record[method] + "\n" + (record[uri].length > 30 ? "..." + record[uri].substring(record[uri].length - 30, record[uri].length) : record[uri]) }
                    </Tooltip>
                },
            },
            {
                title: langTrans("log field2"),
                dataIndex: "datas",
                width: 240,
                render: (_, record) => {
                    let _method = record[method];
                    if (_method === REQUEST_METHOD_GET) {
                        return <JsonView 
                            src={record[param]}   
                            name="response"
                            theme={ "bright" }
                            collapsed={false}  
                            indentWidth={4}  
                            iconStyle="triangle"
                            enableClipboard={true}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            collapseStringsAfterLength={40}  />;
                    } else {
                        return <JsonView 
                            src={record[body]}   
                            name="response"
                            theme={ "bright" }
                            collapsed={false}  
                            indentWidth={4}  
                            iconStyle="triangle"
                            enableClipboard={true}
                            displayObjectSize={false}
                            displayDataTypes={false}
                            collapseStringsAfterLength={40}  />;
                    }
                },
            },
            {
                title: langTrans("log field3"),
                dataIndex: response,
                render: (content, record) => {
                    if (record[jsonFlg]) {
                        return <JsonView 
                        src={JSON.parse(content)}   
                        name="response"
                        theme={ "bright" }
                        collapsed={true}  
                        indentWidth={4}  
                        iconStyle="triangle"
                        enableClipboard={true}
                        displayObjectSize={false}
                        displayDataTypes={false}
                        collapseStringsAfterLength={40}  />
                    } else if (record[htmlFlg]) {
                        return <TextArea
                            value={content}
                            readOnly={ true }
                            autoSize={{ minRows: 5 }}
                        />
                    } else if (record[picFlg]) {
                        return <img style={{maxHeight: 100}} src={content} />
                    } else if (record[fileFlg]) {
                        return content
                    }

                },
            },
            {
                  title: langTrans("log field4"),
                  witdh: 60,
                  dataIndex: ctime,
                  render: (time) => { return getdayjs(time).format("MM-DD HH:mm")},
            },
            {
                title: langTrans("log field5"),
                key: 'operater',
                width: 40,
                render: (_, record) => {
                  return (
                    <Space>
                        <Button type="link" href={ "#/internet_request_send_by_history/" + record[id] } icon={<EyeOutlined />} />
                    </Space>
                  )
                },
              }
        ];
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("log title")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("log bread1") }, { title: langTrans("log bread2") }]}></Breadcrumb>
                    <Flex vertical gap="middle">
                        <Flex justify="space-between" align="center">
                            <SelectPrjEnvComponent prj={ this.state.prj ? this.state.prj : this.props.prj } env={ this.state.env ? this.state.env : this.props.env } cb={this.getEnvValueData} />
                        </Flex>
                        <Flex>
                            <Form layout='inline' onFinish={ this.onFinish } autoComplete="off">
                                <Form.Item<FieldType>
                                    label={langTrans("log select1")}
                                    name="uri"
                                    rules={[{ required: false }]}
                                >
                                    <Input />
                                </Form.Item>

                                <RangePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    defaultValue={[getdayjs(this.state.btime), getdayjs(this.state.etime)]}
                                    onChange={(value, dateString) => {
                                        this.setState({btime: value[0]?.valueOf(), etime: value[1]?.valueOf()});
                                    } }
                                />

                                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                    <Space>
                                        <Button type="primary" htmlType="submit">
                                            {langTrans("log btn")}
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Flex>
                        
                        <Table dataSource={this.state.list} columns={this.listColumn()} />
                    </Flex>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by 方海亮
                </Footer>
            </Layout>
        )
    }
}

function mapStateToProps (state) {
    return {
        prj: state.env_var.prj,
        env: state.env_var.env,
    }
  }
  
  export default connect(mapStateToProps)(RequestHistoryContainer);
                