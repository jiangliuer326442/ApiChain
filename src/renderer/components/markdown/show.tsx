import { Component, ReactNode } from 'react';
import { Flex, FloatButton, message } from 'antd';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import CopyToClipboard from 'react-copy-to-clipboard';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'github-markdown-css/github-markdown-dark.css';
import Markdown from 'react-markdown';
import { langTrans } from '@lang/i18n';

export default class extends Component {

    constructor(props) {
        super(props);

        this.state = {
            content: ""
        }
    }

    componentDidMount(): void {
        let content = this.getContent(this.props.content);
        this.setState({ content });
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.content !== nextProps.content) {
            let content = this.getContent(nextProps.content);
            this.setState({ content });
        }
    }

    getContent = (content) => {
        return "<style>\nimg {width: 40%;}\ntable { width: 100%; }\ntable { background-color: #1d1d1d; border-collapse: collapse; }\ntable thead { height: 29px; }\ntable thead th { border: 1px solid #525252; }\ntable thead { background-color: #1f1f1f; }\ntable thead { background-color: #141414; }\ntable tbody { height: 24px; }\ntable th { text-align: center; }\ntable td { text-align: left; }</style>\n\n" + content;
    }

    render() : ReactNode {
        let that = this;
        return (
            <Flex className='ReackMarkerContainer' gap={"middle"}>
                <Flex>
                    <div className="ReackMarkerContent" style={{ width: this.props.width === undefined ? 920 : this.props.width }}>
                        <Markdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                            
                                    if (children === undefined) {
                                        return null;
                                    }

                                    return !inline && match ? (
                                        <div style={{ position: 'relative' }}>
                                            <CopyToClipboard text={String(children).replace(/\n$/, '')} onCopy={()=>{
                                                message.success(langTrans("md copy success"));
                                            }}>
                                            <button
                                                style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                padding: '5px 10px',
                                                backgroundColor: '#f0f0f0',
                                                border: '1px solid #ccc',
                                                cursor: 'pointer',
                                                }}
                                            >
                                                {langTrans("md copy ready")}
                                            </button>
                                            </CopyToClipboard>
                                            <SyntaxHighlighter style={dracula} PreTag="div" language={match[1]} {...props}>
                                            {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code className={className} {...props}>
                                        {children}
                                        </code>
                                    );
                                },
                            }}
                            children={ this.state.content }
                        />
                    </div>
                </Flex>
                <FloatButton.BackTop />
            </Flex>
        )
    }

}