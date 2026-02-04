import {  Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { 
    Button, 
    List, 
    Breadcrumb,
    Divider,
    Flex, 
    Layout 
} from 'antd';

import { langTrans } from '@lang/i18n';
import { getApplyUsers } from '@act/team'

const { Header, Content, Footer } = Layout;

class TeamMember extends Component {

    constructor(props) {
        super(props);
        this.state = {
            initLoading: true,
            applyList: [],
        }
    }

    async componentDidMount() {
        getApplyUsers().then((res) => {
            console.log("getApplyUsers res=", res);
            const results = Array.isArray(res) ? res : [];
            this.setState({
                initLoading: false,
                applyList: results,
            });
        });
    }

    render(): ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                {langTrans("nav setting member")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Flex justify="space-between" align="center">
                        <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: langTrans("env bread1")}, { title: langTrans("nav setting member") }]} />
                    </Flex>
                    <Divider orientation="left">{langTrans("setting member apply title")}</Divider>
                    <div
                        style={{paddingLeft: 58, paddingRight: 58}}
                    >
                        <List
                            className="demo-loadmore-list"
                            loading={this.state.initLoading}
                            itemLayout="horizontal"
                            dataSource={this.state.applyList}
                            renderItem={(item) => (
                                <List.Item
                                actions={[
                                    <Button type='link'>{langTrans("setting member apply table btn1")}</Button>, 
                                    <Button type='text' danger>{langTrans("setting member apply table btn2")}</Button>
                                ]}
                                >
                                    <List.Item.Meta
                                        title={item.uname}
                                        description={item.applyContent}
                                    />
                                    <div>{item.applyTime}</div>
                                </List.Item>
                            )}
                        />
                    </div>
                    <Divider orientation="left">{langTrans("setting member users title")}</Divider>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                ApiChain ©{new Date().getFullYear()} Created by Mustafa Fang
                </Footer>
            </Layout>
        )
    }

}

function mapStateToProps (state) {
    return {
    }
}

export default connect(mapStateToProps)(TeamMember);