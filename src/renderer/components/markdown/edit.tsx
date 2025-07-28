import { Component, ReactNode } from 'react';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

import './dark-mde.less';

import { isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';

export default class extends Component {

    constructor(props) {
        super(props);

        let content = props.content;

        this.state = {
            markdown: isStringEmpty(content) ? langTrans("iterator md content") : content,
            selectedTab: props.mode === "add" ? "write":"preview",
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
                selectedTab={this.state.selectedTab}
                onTabChange={selectedTab => this.setState({selectedTab})}
                value={this.state.markdown}
                generateMarkdownPreview={markdown => Promise.resolve(this.converter.makeHtml(markdown))}
                onChange={(markdown: string) => {
                    this.setState({ markdown });
                    this.props.cb(markdown);
                }} 
            ></ReactMde>
        )
    }

}