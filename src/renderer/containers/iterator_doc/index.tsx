import { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Breadcrumb, Layout, Result } from "antd";

import { DOC_ITERATOR } from '@conf/storage';
import {
    CONTENT_TYPE_URLENCODE
} from '@conf/contentType';
import MarkdownView from '@comp/markdown/show';
import { langTrans } from '@lang/i18n';

const { Header, Content, Footer } = Layout;

class IteratorDoc extends Component {

    constructor(props) {
        super(props);
        let iteratorId = this.props.match.params.uuid;
        sessionStorage.setItem(DOC_ITERATOR, iteratorId);
        this.state = {
            iteratorId,
            md: "",
            versionIteration: "",
            requests: [],
            prjs: [],
            envs: [],
            envVars: {},
            errorCode: 1000,
            errorMessage: "",
        };
    }

    async componentDidMount() {
        try {
            axios.post("/sprint/docs", { 
                iteratorId: this.state.iteratorId 
            }, {
                headers: {
                    "Content-Type": CONTENT_TYPE_URLENCODE,
                }
            }).then(response => {
                if (response.data.code === 1000) {
                    this.setState({
                        md: response.data.data.markdown
                    });
                    document.title = response.data.data.title;
                } else {
                    this.setState({
                        errorCode: response.data.code,
                        errorMessage: response.data.message,
                    });
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    render() : ReactNode {
        return (
            <Layout>
                <Header style={{ padding: 0 }}>
                    {langTrans("doc btn1")}
                </Header>
                <Content style={{ padding: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={[
                        { title: langTrans("doc bread1") }, 
                        { title: langTrans("doc bread2") }
                    ]} />
                    {this.state.errorCode === 1000 ? 
                    <MarkdownView showNav={ true } content={ this.state.md } show={ true } />
                    : null}
                    {(this.state.errorCode === 403 || this.state.errorCode === 404) ?
                    <Result
                        status={ this.state.errorCode }
                        title={ this.state.errorCode }
                        subTitle={this.state.errorMessage}
                    />
                    : null} 
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
        clientType: state.device.clientType,
    }
}
      
export default connect(mapStateToProps)(IteratorDoc);