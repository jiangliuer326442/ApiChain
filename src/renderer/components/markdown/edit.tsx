import { Component, ReactNode } from 'react';
import ReactMde, { ReactMdeTypes } from 'react-mde';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

import { isStringEmpty } from '@rutil/index';
import { langTrans } from '@lang/i18n';

export default class extends Component {

    constructor(props) {
        super(props);

        let content = props.content;

        this.state = {
            mdeState: {
                markdown: isStringEmpty(content) ? langTrans("iterator md content") : content,
            },
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