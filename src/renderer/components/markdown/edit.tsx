import { Component, ReactNode } from 'react';
import ReactMde, { ReactMdeTypes } from 'react-mde';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

import { isStringEmpty } from '../../util';

export default class extends Component {

    constructor(props) {
        super(props);

        let content = props.content;

        this.state = {
            mdeState: {
                markdown: isStringEmpty(content) ? '在这里可以使用markdown语法记录下这个迭代的注意事项、表结构变更、配置中心配置、定时任务等\n\n## 注意事项\n\n## 接口变更记录\n\n## 数据库变更\n\n## 配置中心变更\n\n## 定时任务变更\n\n' : content,
            }
        }

        this.converter = new Showdown.Converter({
            omitExtraWLInCodeBlocks: true,
            parseImgDimensions: true,
            tables: true,
            tablesHeaderId: true,
            underline: true,
            simplifiedAutoLink: true,
            strikethrough: true,
            tasklists: true,
        });
    }

    render() : ReactNode {
        return (
            <ReactMde
                className="react_me"
                layout="horizontal"
                editorState={this.state.mdeState}
                generateMarkdownPreview={markdown => Promise.resolve(this.converter.makeHtml(markdown))}
                onChange={(mdeState: ReactMdeTypes.MdeState) => {
                    this.setState({ mdeState });
                    this.props.cb(mdeState.markdown);
                }} 
            ></ReactMde>
        )
    }

}