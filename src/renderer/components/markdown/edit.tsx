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
                markdown: isStringEmpty(content) ? '# 迭代标题\n[百度](http://www.baidu.com)\n\n![baidu](https://www.baidu.com/img/PCfb_5bf082d29588c07f842ccde3f97243ea.png)\n\n' : content,
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